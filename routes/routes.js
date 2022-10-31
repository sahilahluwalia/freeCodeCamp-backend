const express = require("express");
const router = express.Router();
const userModel = require("../models/userModels");
const jsonwebtoken = require("jsonwebtoken");
const KEY = process.env.SECRET_KEY;
module.exports = router;

const { data } = require("../controllers/dataController");

let refreshTokens = [];
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

  try {
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json("User not found");
    }
    if (existingUser.password !== password) {
      return res.status(400).json({ message: "invalid password" });
    }
    const token = generateAccessToken(existingUser);
    const refreshToken = jsonwebtoken.sign({ email: existingUser.email }, KEY);
    // return res.status(404).json("User not found");
    refreshTokens.push(refreshToken);
    return res.status(200).json({
      email: existingUser.email,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json("Catch Error");
  }
};

const token = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jsonwebtoken.verify(refreshToken, KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    const token = generateAccessToken({ email: user.email });
    res.status(200).json({ token: token });
  });
};

function generateAccessToken(existingUser) {
  return jsonwebtoken.sign({ email: existingUser.email }, KEY, {
    expiresIn: "10m",
  });
}
const signout = (req, res) => {
  console.log("req.body.token");
  console.log(req.body.token);
  const mytoken = req.body.token;
  console.log(`before :` + refreshTokens);
  console.log(mytoken);
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);

  console.log(`after :` + refreshTokens);
  return res.status(200).json({
    refreshTokens: refreshTokens,
    giventoken: mytoken,
  });
};

router.post("/auth/signup", signup);

router.post("/auth/signin", signin);
router.post("/token", token);

router.get("/getdata", authToken, data);

router.delete("/auth/signout", signout);

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jsonwebtoken.verify(token, KEY, (err, user) => {
    if (err) return res.status(403).json("token expried");
    req.user = user;
    next();
  });
}
