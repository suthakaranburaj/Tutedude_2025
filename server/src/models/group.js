import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Prevent model recompilation in hot-reloading environments
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
export default Group;