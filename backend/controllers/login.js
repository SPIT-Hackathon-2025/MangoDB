const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      return res
        .status(409)
        .json({ message: "User is already present", exists });
    } else {
      const user = await User.create(req.body);
      return res.status(201).json({ user });
    }
  } catch (err) {
    console.error(err);
    // Handle the error and send an appropriate response
    return res
      .status(500)
      .json({ err: err.message || "Internal Server Error" });
  }
};

const findUser = async (req, res) => {
  try {
    const { email, pwd: password } = req.params;
    // const { password } = req.body;
    // console.log("why am i here");
    console.log(password);
    // console.log(req.body);
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(400).json({ fetch: "User not found please Sign Up" });
    if (user.password === password) {
      // console.log(user._id);
      return res.status(201).json({ fetch: "successful", user });
    } // return res.status(201).json({ fetch: "successful", user });
    else
      return res
        .status(400)
        .json({ fetch: "Login unsuccessful, please enter correct password" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};
module.exports = { createUser, findUser };
