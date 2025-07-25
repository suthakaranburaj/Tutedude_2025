import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2 },
    phone: { type: String },
    pin: {
      type: String,
      required: true,
      minlength: 4
    },
    role: {
      type: String,
      enum: ["vendor", "normal_user", "supplier", "agent"],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;