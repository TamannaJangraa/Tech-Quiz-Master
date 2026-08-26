import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkID: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String,
        required: true,

    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }

}, {timestamps:true});

const User = mongoose.model("User", userSchema);
export default User;