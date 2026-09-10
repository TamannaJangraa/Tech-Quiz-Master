import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../model/user.js";

const ADMIN_EMAILS_RAW = process.env.ADMIN_EMAILS || "jangratamanna970@gmail.com";
const ADMIN_EMAILS = ADMIN_EMAILS_RAW.split(",").map((e) => e.trim().toLowerCase());

console.log("[Auth] Admin emails configured:", ADMIN_EMAILS);

const isAdminEmail = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

const syncUserFromClerk = async (clerkUserId) => {
    try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        if (!clerkUser) return null;

        const primaryEmail = clerkUser.emailAddresses?.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || "";

        const role = isAdminEmail(primaryEmail) ? "admin" : "student";

        console.log(`[Auth] Syncing user ${clerkUserId}: email="${primaryEmail}", role="${role}"`);

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
            console.log("[Auth] isAdmin blocked: no Clerk userId in request");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let user = await User.findOne({ clerkID: userId });

        if (!user) {
            console.log(`[Auth] isAdmin: user ${userId} not in DB, syncing from Clerk...`);
            user = await syncUserFromClerk(userId);
        }

        if (!user) {
            console.log(`[Auth] isAdmin blocked: user ${userId} sync failed`);
            return res.status(403).json({
                success: false,
                message: "Access denied. User profile not found. Please log out and log back in.",
            });
        }

        if (isAdminEmail(user.email) && user.role !== "admin") {
            console.log(`[Auth] isAdmin: promoting user ${user.email} to admin role`);
            user.role = "admin";
            await user.save();
        }

        console.log(`[Auth] isAdmin check: user=${user.email}, role=${user.role}, admin=${user.role === "admin"}`);

        if (user.role === "admin") {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: `Access denied. Admins only. Your email (${user.email}) is not in the admin list.`,
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

