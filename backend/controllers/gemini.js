const fs = require("fs");
const path = require("path");
const model = require("../services/gemini.js"); // Ensure this correctly calls Gemini API
const multer = require("multer");

// Configure Multer to handle image uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // Example: 5MB limit
});

const run = async (req, res) => {
  try {
    const { question } = req.body;
    let imageBase64 = null;
    let mimeType = null;

    // Check if an image file was uploaded
    if (req.file) {
      const imagePath = path.join(__dirname, "../", req.file.path);
      const imageBuffer = fs.readFileSync(imagePath);
      imageBase64 = imageBuffer.toString("base64");
      mimeType = req.file.mimetype; // Get the MIME type from the uploaded file

      // Delete the temp image after encoding
      fs.unlinkSync(imagePath);
    }

    // Validate image size (example)
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).send("Image size exceeds the limit (5MB)");
    }

    // Construct the input for Gemini (ADJUST THIS BASED ON OFFICIAL DOCS!)
    let input = {
      contents: [
        {
          parts: [{ text: question }],
        },
      ],
    };

    // Add image if available
    if (imageBase64) {
      if (!mimeType) {
        return res.status(400).send("Image MIME type is missing");
      }

      input.contents[0].parts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64,
        },
      });
    }

    // Generate response from Gemini
    const result = await model.generateContent(input); // Assuming model.generateContent is set up correctly
    const response = result.response;
    const text = response.text();

    console.log(text);
    res.send(text);
  } catch (err) {
    console.error("Error processing Gemini request:", err); // More detailed logging
    if (err.message.includes("file size")) {
      return res.status(400).send(`File size error: ${err.message}`);
    }
    res.status(500).send(`Internal Server Error: ${err}`);
  }
};

// Export route with Multer middleware for file upload
module.exports = { run: [upload.single("image"), run] };
