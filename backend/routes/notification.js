import express from "express";
import Notification from "../models/Notification.js";
import Room from "../models/Room.js";

const router = express.Router();

// Fetch notifications for a user
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "username")
            .populate("room", "name")
            .sort({ createdAt: -1 })
            .lean();
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Send an invite
router.post("/send", async (req, res) => {
    try {
        const { recipient, sender, room } = req.body;

        // Check if already invited
        const existing = await Notification.findOne({ recipient, sender, room, status: 'Pending' });
        if (existing) {
            return res.status(400).json({ message: "Invite already sent" });
        }

        const notification = new Notification({ recipient, sender, room });
        await notification.save();
        res.json({ message: "Invite sent successfully", notification });
    } catch (error) {
        console.error("Error sending invite:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Respond to an invite
router.post("/respond", async (req, res) => {
    try {
        const { notificationId, status } = req.body;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.status = status;
        await notification.save();

        if (status === 'Accepted') {
            await Room.findByIdAndUpdate(notification.room, {
                $addToSet: { members: notification.recipient }
            });
        }

        res.json({ message: `Invite ${status.toLowerCase()}ed` });
    } catch (error) {
        console.error("Error responding to invite:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
