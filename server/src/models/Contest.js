import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true }, // e.g., "Codeforces"
    name: { type: String, required: true },
    url: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationSeconds: { type: Number }
  },
  { timestamps: true }
);

contestSchema.index({ startTime: 1 });
export default mongoose.model("Contest", contestSchema);
