import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../model/user.js";

const ADMIN_EMAIL = "jangratamanna970@gmail.com";

const syncUserFromClerk = async (clerkUserId) => {
    try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        if (!clerkUser) return null;

        const primaryEmail = clerkUser.emailAddresses?.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || "";

        const role = primaryEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

        const user = await User.findOneAndUpdate(
            { clerkID: clerkUserId },
            {
                clerkID: clerkUserId,
                email: primaryEmail,
                fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                role: role,
                isLoggedIn: true,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return user;
    } catch (err) {
        console.error("Error syncing user from Clerk:", err.message || err);
        return null;
    }
};

export const protect = (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user ID" });
    }
    next();
};

export const isAdmin = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let user = await User.findOne({ clerkID: userId });

        if (!user) {
            user = await syncUserFromClerk(userId);
        }

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Access denied. User profile not found. Please log out and log back in.",
            });
        }

        if (user.role === "admin") {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
        }
    } catch (err) {
        console.error("isAdmin middleware error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error during authorization.",
        });
    }
};

