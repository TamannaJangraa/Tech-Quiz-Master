import { getAuth } from "@clerk/express";
import User from "../model/user.js";

export const protect = (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID" });
    }
    next();
};

export const isAdmin = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findOne({ clerkID: userId });
        if (user && user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access denied...Admins only" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error", err });
    }
};

