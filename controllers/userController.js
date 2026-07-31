import userSchema from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { getModel } from "../config/db.js";

const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const User = await getModel("Authentication", "User", userSchema);

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400);
    throw new Error("Username already exists");
  }
  const user = new User({
    username,
    password: await bcrypt.hash(password, 10),
  });
  await user.save();
  res.status(201).json({ token: generateToken(res, user._id) });
});

const registerTeamManager = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const User = await getModel("Authentication", "User", userSchema);

  if(!username || !password) {
    throw Error("Some Fields are missing!")
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400);
    throw new Error("Username already exists");
  }
  const user = new User({
    username,
    role: "community",
    password: await bcrypt.hash(password, 10),
  });
  await user.save();
  res.status(201).json({ message: `${username} created` });
});

const getRegisteredTeamManagers = asyncHandler(async (req, res) => {
  const User = await getModel("Authentication", "User", userSchema);
  const users = await User.find({role: 'community'}).select("-password")
  res.json(users)
})

const deleteTeamManager = asyncHandler(async (req, res) => {
  const User = await getModel("Authentication", "User", userSchema);
  const teamId = req.params.id;
  const community = await User.findById(teamId);
  if (community) {
    await User.deleteOne({ _id: teamId });

    res.json({ message: "Community and associated data deleted" });
  } else {
    res.status(404);
    throw new Error("Community not found");
  }
})

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const User = await getModel("Authentication", "User", userSchema);
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      hasPicks: user.hasPicks
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

//@desc Logout user
//@route POST /api/users/logout
//@access Public
const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
});

const getProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    _id: req.user._id,
    username: req.user.username,
    team: req.user.team,
  });
};

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export { register, login, logout, getProfile, registerTeamManager, getRegisteredTeamManagers, deleteTeamManager };
