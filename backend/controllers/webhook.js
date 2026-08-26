import User from '../model/user.js';
import 'dotenv/config';
import {Webhook} from 'svix';

export const clerkWebhook = async (req, res) => {
    try {
        console.log("Webhook Hit🔥");
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        const payload = req.body.toString();
        const headers = req.headers;

        const wh = new Webhook(WEBHOOK_SECRET);
        const evt = wh.verify(payload, {
            "svix-id": headers["svix-id"],
            "svix-timestamp": headers["svix-timestamp"],
            "svix-signature": headers["svix-signature"],
        });
        const { type, data } = evt;
        console.log("EVENT TYPE:", type);

        if (type === "user.created") {
            const primaryEmail = data.email_addresses?.find(
                (e) => e.id === data.primary_email_address_id
            )?.email_address || "";
            const role = primaryEmail === "jangratamanna970@gmail.com"
                ? "admin" : "user";
            await User.findOneAndUpdate(
                { clerkID: data.id },
                {
                    clerkID: data.id,
                    email: primaryEmail,
                    fullName: `${data.first_name || ""} ${data.last_name || ""}`,
                    role: role
                },
                { upsert: true, new: true }
            );
        }

        if (type === "session.created") {
            console.log("LOGIN DETECTED");
            await User.findOneAndUpdate(
                { clerkID: data.user_id },
                {
                    clerkID: data.user_id,
                    isLoggedIn: true
                },
                { upsert: true, new: true }
            );
        }

        if (type === "session.ended") {
            console.log("LOGOUT DETECTED");
            await User.findOneAndUpdate(
                { clerkID: data.user_id },
                {
                    clerkID: data.user_id,
                    isLoggedIn: false
                },
                { upsert: true, new: true }
            );
        }

        if (type === "session.removed") {
            console.log("SESSION REMOVED DETECTED");
            await User.findOneAndUpdate(
                { clerkID: data.user_id },
                {
                    clerkID: data.user_id,
                    isLoggedIn: false
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({ success: true });

    } catch (err) {
        console.log("WEBHOOK ERROR", err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
 
