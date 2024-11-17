import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

export const UserRepository = Object.freeze({
  findById: async (id: any) => User.findById(id),
  findByName: async (username: any) => User.findOne({ username }),
  create: async (username: string, password: string, role: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    return user.save();
  }
});

export default User;
