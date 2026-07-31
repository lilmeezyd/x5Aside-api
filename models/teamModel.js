import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String,
  short_name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: ""},
  url: { type: String, default:"" },
  fileId: { type: String, default: "" },
  fileName: { type: String, default: "" },
  players: [{ type:  mongoose.Schema.Types.ObjectId, ref: "Player",
  primaryColor: { type: String, default: ""},
  secondaryColor: { type: String, default: ""},
  color: { type: String, default: ""}   
}]}, { timestamps: true });
/*const Team = mongoose.model("Team", teamSchema);
*/
export default teamSchema;
