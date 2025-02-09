const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./services/connect");
const multer = require("multer");
const path = require("path");
const Issue = require("./models/Issue");
const found = require("./models/found");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { reverseGeocode } = require('./services/location');
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingInterval: 10000, // Send ping every 10 seconds
  pingTimeout: 5000, // Wait 5 seconds for pong
  transports: ["websocket"], // Force WebSocket only
  upgrade: false, // Disable transport upgrades
});

const mongoUri = process.env.MONG_URI;

if (!mongoUri) {
  console.error("❌ MongoDB URI is not defined. Check your .env file.");
  process.exit(1);
}
var admin = require("firebase-admin");
const llm = require("./routes/lmm");
const gemini = require("./routes/gemini");
// var serviceAccount = require("./spithack-dab01-firebase-adminsdk-fbsvc-ebd65a8127.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const port = 5001;
// Middleware
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
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Broadcast to all clients that a new user connected
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

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
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
    io.emit("receiveNotification", { title, message }); // Emit to connected clients
    res.json({ success: true, message: "SOS Alert Sent!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to handle form submission
app.post("/api/report-issue", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received");
    console.log("Body:", req.body); // Log form fields (description, location)
    console.log("File:", req.file); // Log file data

    // Ensure required data is received
    if (!req.body.description || !req.body.location || !req.file) {
      return res.status(400).json({
        error:
          "Please provide all required details (description, location, image)",
      });
    }

    // Process the received data
    const { description, location } = req.body;
    const { path: imagePath } = req.file; // File path for the uploaded image

    // Parse location to get latitude and longitude
    const parsedLocation = JSON.parse(location); // location should be a stringified object
    console.log(location)
    const { latitude, longitude } = parsedLocation;
    

    // Get the actual address from latitude and longitude using reverse geocoding
    const address = await reverseGeocode(latitude, longitude);

    // If reverse geocoding fails
    if (!address) {
      return res.status(500).json({ error: "Could not retrieve address from coordinates" });
    }

    // Create a new issue object with the address
    const newIssue = new Issue({
      description,
      location: parsedLocation, // Store latitude and longitude
      address, // Store the human-readable address
      imageUrl: imagePath, // You can store the image path or URL here
    });

    // Save the issue to the database
    await newIssue.save();

    // Send a success response
    res.status(200).json({ message: "Issue reported successfully" });
  } catch (error) {
    console.error("Error handling the report:", error.message);
    res.status(500).json({ error: "There was an issue reporting the problem" });
  }
});

// Route to handle item found
app.post("/api/item-found", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received");
    console.log("Body:", req.body); // Log form fields (description, location)
    console.log("File:", req.file); // Log file data

    // Ensure required data is received
    if (!req.body.description || !req.body.location || !req.file) {
      return res.status(400).json({
        error:
          "Please provide all required details (description, location, image)",
      });
    }

    // Process the received data
    const { description, location } = req.body;
    const { path: imagePath } = req.file; // File path for the uploaded image

    // Parse location to get latitude and longitude
    const parsedLocation = JSON.parse(location); // location should be a stringified object
    console.log(location)
    const { latitude, longitude } = parsedLocation;
    

    // Get the actual address from latitude and longitude using reverse geocoding
    const address = await reverseGeocode(latitude, longitude);

    // If reverse geocoding fails
    if (!address) {
      return res.status(500).json({ error: "Could not retrieve address from coordinates" });
    }

    // Create a new issue object with the address
    const newFound = new found({
      description,
      location: parsedLocation, // Store latitude and longitude
      address, // Store the human-readable address
      imageUrl: imagePath, // You can store the image path or URL here
    });

    // Save the issue to the database
    await newFound.save();

    // Send a success response
    res.status(200).json({ message: "Issue reported successfully" });
  } catch (error) {
    console.error("Error handling the report:", error.message);
    res.status(500).json({ error: "There was an issue reporting the problem" });
  }
});

app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues); // Send the issues as JSON response
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues", error });
  }
});

const start = async () => {
  try {
    await connectDB(mongoUri);
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err.message);
  }
};

start();
