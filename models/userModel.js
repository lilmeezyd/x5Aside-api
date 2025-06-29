import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }
});
/*
const User = mongoose.model("User", userSchema, "users");*/

export default userSchema;