const axios = require("axios");

const reverseGeocode = async (latitude, longitude) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  try {
    const response = await axios.get(geocodeUrl, {
      headers: { "User-Agent": "IssueReportingApp/1.0" },
    });

    if (response.data && response.data.name) {
      const address = response.data.name;
      console.log("Resolved Address:", address);
      return address;
    } else {
      console.error("Response data:", response.data);
      throw new Error("Unable to find address");
    }
  } catch (error) {
    console.error("Error during geocoding:", error.message);
    return null;
  }
};

module.exports = { reverseGeocode };
