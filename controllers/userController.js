import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const register =  asyncHandler(async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const user = new User({ username, password: await bcrypt.hash(password, 10), isAdmin });
  await user.save();
  res.json({ token: generateToken(user._id) });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});



const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export { register, login };