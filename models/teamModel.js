import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String,
  short_name: String,
  players: [{ type:  mongoose.Schema.Types.ObjectId, ref: "Player"
}]}, { timestamps: true });
/*const Team = mongoose.model("Team", teamSchema);
*/
export default teamSchema;
