const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./services/connect");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Issue = require("./models/Issue");
const found = require("./models/found");
const lost= require("./models/lost");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { reverseGeocode } = require("./services/location");


dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ["websocket"],
  upgrade: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUri = process.env.MONG_URI;
if (!mongoUri) {
  console.error("❌ MongoDB URI is not defined. Check your .env file.");
  process.exit(1);
}

var admin = require("firebase-admin");
const llm = require("./routes/lmm");
const gemini = require("./routes/gemini");

const port = 5001;
app.use(cors());
app.use(express.json());
const login = require("./routes/login");

app.use("/login", login);
app.use("/llm", llm);
app.use("/gemini", gemini);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Express Server is Running!" });
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// WebSocket connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  io.emit("userCount", io.engine.clientsCount);

  socket.on("sendForumMessage", (message) => {
    const messageWithId = {
      ...message,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    };
    io.emit("receiveForumMessage", messageWithId);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit("userCount", io.engine.clientsCount);
  });

  socket.on("error", (error) => console.error("Socket error:", error));
});

app.post("/forum", (req, res) => {
  try {
    const { username, message } = req.body;
    if (!username || !message) {
      return res
        .status(400)
        .json({ error: "Username and message are required" });
    }

    const forumMessage = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };
    io.emit("receiveForumMessage", forumMessage);

    res
      .status(200)
      .json({ success: true, message: "Forum message broadcasted" });
  } catch (error) {
    console.error("Error in /forum endpoint:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// SOS Alert Endpoint
app.post("/send-sos", async (req, res) => {
  const { title, message } = req.body;
  const messagePayload = {
    notification: {
      title: title || "🚨 Emergency Alert!",
      body: message || "Someone nearby triggered an SOS!",
    },
    topic: "sos-alerts",
  };

  try {
    await admin.messaging().send(messagePayload);
    io.emit("receiveNotification", { title, message });
    res.json({ success: true, message: "SOS Alert Sent!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Issue Reporting
app.post("/api/report-issue", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received:", req.body);
    if (!req.body.description || !req.body.location || !req.file) {
      return res
        .status(400)
        .json({ error: "Provide description, location, and image" });
    }

    const { description, location } = req.body;
    const { path: imagePath } = req.file;
    const parsedLocation = JSON.parse(location);
    const { latitude, longitude } = parsedLocation;

    const address = await reverseGeocode(latitude, longitude);
    if (!address) {
      return res.status(500).json({ error: "Could not retrieve address" });
    }

    const newIssue = new Issue({
      description,
      location: parsedLocation,
      address,
      imageUrl: imagePath,
    });
    await newIssue.save();

    res.status(200).json({ message: "Issue reported successfully" });
  } catch (error) {
    console.error("Error handling report:", error.message);
    res.status(500).json({ error: "Issue reporting error" });
  }
});

// Route to handle item found
app.post("/api/item-found", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    if (!req.body.description || !req.body.location || !req.file) {
      return res.status(400).json({
        error: "Please provide all required details (description, location, image)"
      });
    }

    const { description, location } = req.body;
    const { path: imagePath } = req.file;

    const parsedLocation = JSON.parse(location);;
    const { latitude, longitude } = parsedLocation;

    const address = await reverseGeocode(latitude, longitude);
    if (!address) {
      return res
        .status(500)
        .json({ error: "Could not retrieve address from coordinates" });
    }

    const newFound = new found({
      description,
      location: parsedLocation,
      address,
      imageUrl: imagePath,
    });

    const savedItem = await newFound.save();
    console.log("Saved found item:", savedItem);

    res.status(200).json({ 
      message: "Found item reported successfully",
      item: savedItem 
    });
  } catch (error) {
    console.error("Error handling found item report:", error);
    res.status(500).json({ 
      error: "There was an error reporting the found item",
      details: error.message 
    });
  }
});

// Route to handle item lost
app.post("/api/item-lost", async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Request body is empty"
      });
    }

    const { description, location } = req.body;

    if (!description || !location) {
      return res.status(400).json({
        error: "Please provide all required details (description, location)"
      });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        error: "Invalid location format"
      });
    }

    const address = await reverseGeocode(location.latitude, location.longitude);
    if (!address) {
      return res.status(500).json({ error: "Could not retrieve address from coordinates" });
    }

    const newLost = new lost({
      description,
      location,
      address
    });

    const savedItem = await newLost.save();
    console.log("Saved lost item:", savedItem);

    res.status(200).json({ 
      message: "Lost item reported successfully",
      item: savedItem 
    });
  } catch (error) {
    console.error("Error handling lost item report:", error);
    res.status(500).json({ 
      error: "There was an error reporting the lost item",
      details: error.message 
    });
  }
});

app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues", error });
  }
});

app.get("/api/found-items", async (req, res) => {
  try {
    const items = await found.find();
    console.log(items)
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

app.get("/api/lost-items", async (req, res) => {
  try {
    const items = await lost.find();
    console.log(items)
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

///// ✅ **CSV Handling: Append Data to `data.csv`** ✅ /////

// CSV File Path
const csvFilePath = "../flask/lostAndFoun.csv";

// Ensure CSV file has headers (only if it doesn't exist)
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(
    csvFilePath,
    "Product Name,Person Name,Contact,Description\n"
  );
}

// Append to CSV Endpoint
app.post("/api/append-csv", (req, res) => {
  const { productName, personName, Contact, description } = req.body;

  if (!productName || !personName || !Contact || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newRow = `"${productName}","${personName}","${Contact}","${description}"\n`;

  fs.appendFile(csvFilePath, newRow, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to append data" });
    }
    res.json({ message: "Data appended successfully!" });
  });
});
app.get("/api/found/query", async (req, res) => {
  const { description } = req.body;
  console.log(description);
  return res.json({ message: description });
});

const start = async () => {
  try {
    await connectDB(mongoUri);
    server.listen(port, () =>
      console.log(`Server running at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Error starting server:", err.message);
  }
};

start();
