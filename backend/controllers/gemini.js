const model = require("../services/gemini.js");
const run = async (req, res) => {
  try {
    const question = req.body.question;
    const result = await model.generateContent(`${question}`);
    const response = result.response;
    const text = response.text();
    console.log(text);
    res.send(text);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Internal Server Error ${err}`);
  }
};
module.exports = { run };
