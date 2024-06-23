import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  firstName: { type: mongoose.Schema.Types.String, ref: "User" },
  middleName: { type: mongoose.Schema.Types.String, ref: "User" },
  lastName: { type: mongoose.Schema.Types.String, ref: "User" },
  userName: { type: mongoose.Schema.Types.String, ref: "User" },
  email: { type: mongoose.Schema.Types.String, ref: "User" },
  phone: { type: String },
  dateOfBirth: { type: String },
  age: { type: Number },
  gender: { type: String },
  occupation: { type: String },
  country: { type: String },
});

export const ProfileModel = mongoose.model("Profile", profileSchema);
