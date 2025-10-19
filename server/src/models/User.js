import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, this should be hashed
    codingHandles: {
      codeforces: { type: String },
      leetcode: { type: String },
      codechef: { type: String },
    },
    // This would be populated by a separate service that fetches user stats
    solvedCounts: {
      codeforces: { type: Number, default: 0 },
      leetcode: { type: Number, default: 0 },
      codechef: { type: Number, default: 0 },
      total: { type: Number, default: 0, index: -1 }, // Index for sorting
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate the total solved count
userSchema.pre("save", function (next) {
  this.solvedCounts.total = (this.solvedCounts.codeforces || 0) + (this.solvedCounts.leetcode || 0) + (this.solvedCounts.codechef || 0);
  next();
});

export default mongoose.model("User", userSchema);