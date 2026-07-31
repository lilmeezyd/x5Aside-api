import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  hasPicks: { type: Boolean, default: false}
});
/*
const User = mongoose.model("User", userSchema, "users");*/

export default userSchema;