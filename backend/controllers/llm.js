const axios = require("axios");

const findDep = async (req, res) => {
  try {
    const { query } = req.body;

    const response = await axios.post(
      `http://127.0.0.1:5001/query`,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data.matches;
    const updatedData = data.map(({ Contact, ...rest }) => rest);
    // Send the response from Flask API to the client
    return res.status(200).json(updatedData);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);

    return res.status(500).json({
      error: err.response ? err.response.data : "Internal Server Error",
    });
  }
};

module.exports = { findDep };
