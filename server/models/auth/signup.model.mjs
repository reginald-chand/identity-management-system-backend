import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import slugify from "slugify";

const signUpSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    isUserVerified: { type: Boolean, required: true },
  },
  { timestamps: true }
);

signUpSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.userName = slugify(this.userName, { lower: true, strict: true });
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

export const SignUpModel = mongoose.model("User", signUpSchema);
