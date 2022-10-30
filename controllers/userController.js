const userModel = require("../models/userModels");
const jsonwebtoken = require("jsonwebtoken");
const KEY = process.env.SECRET_KEY;
const signup = async (req, res) => {
  console.log("signup");

  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json("Already Exist");
    }
    const result = await userModel.create({
      email: email,
      password: password,
    });
    const token = jsonwebtoken.sign({ email: result.email }, KEY);
    return res.status(201).json({ user: result, token: token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log("signin");
  console.log(req.body);
  //   console.log({ email, password });
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json("User not found");
    }
    if (existingUser.password !== password) {
      return res.status(400).json({ message: "invalid password" });
    }
    const token = jsonwebtoken.sign({ email: existingUser.email }, KEY);
    // req.session.loggedin = true;
    // req.session.email = email;
    return res.status(201).json({ user: existingUser, token: token });
  } catch (e) {
    console.log(e);
    return res.status(500).json("Catch Error");
  }
};

const home = async (req, res) => {};
module.exports = { signup, signin, home };
