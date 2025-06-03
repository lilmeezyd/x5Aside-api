import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean
});

const User = mongoose.model("User", userSchema, "users");

export default User;