import mongoose from "mongoose";

const pointsTotalSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
        unique: true,
        index: true
    },
    totalPoints: { type: Number, required: true },
    teamName: { type: String, required: true, unique: true },
    rank: { type: Number, default: 0 },
    oldRank: { type: Number, default: 0 },
}, { timestamps: true },)

export default pointsTotalSchema;