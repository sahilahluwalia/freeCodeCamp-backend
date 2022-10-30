const express = require("express");
const router = express.Router();
const jwt = require("express-jwt");
const KEY = process.env.SECRET_KEY;
module.exports = router;

const { signup, signin, home } = require("../controllers/userController");
const { data } = require("../controllers/dataController");
router.post("/auth/signup", signup);

router.post("/auth/signin", signin);

router.get("/getdata", data);

router.get("/home", home);

router.get("/auth/signout", function (request, response) {
  return response.status(200).json(req.session);
  if (request.session.loggedin) {
    return response.status(200).json("Logged in");
  }
  return response.status(400);
});
