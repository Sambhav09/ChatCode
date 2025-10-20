// routes/user.js
import express from "express";
import User from "../models/User.js";
import mongoose from "mongoose";


const router = express.Router();

// GET all users except the sender
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;

        const users = await User.find(
            { _id: { $ne: userId } },
            "username email _id"
        );

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/friends", async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId).populate('friends', 'username email _id');
        console.log("User's friends:", user.friends);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Server error" });
    }
}
)



router.get('/all-users', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const loggedInUserId = new mongoose.Types.ObjectId(userId);

        // 1. Find current user
        const currentUser = await User.findById(loggedInUserId)
            .select('friends sentRequests pendingRequests');

        if (!currentUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Get all other users
        const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('username');

        // 3. Map with status
        const usersWithStatus = allUsers.map(u => {
            let status = 'Add Friend';

            if (currentUser.friends.includes(u._id)) {
                status = 'Friend';
            } else if (currentUser.sentRequests.includes(u._id)) {
                status = 'Request Sent';
            } else if (currentUser.pendingRequests.includes(u._id)) {
                status = 'Pending'; // <-- Corrected
            }

            return {
                _id: u._id,
                username: u.username,
                status
            };
        });

        res.status(200).json(usersWithStatus);

    } catch (error) {
        console.error("Error fetching users with status:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/send-Request", async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Already friends?
        if (fromUser.friends.includes(toUserId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Already sent?
        if (fromUser.sentRequests.includes(toUserId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Already received?
        if (fromUser.pendingRequests.includes(toUserId)) {
            return res.status(400).json({ message: "You already have a pending request from this user" });
        }

        fromUser.sentRequests.push(toUserId);
        toUser.pendingRequests.push(fromUserId);

        await fromUser.save();
        await toUser.save();

        res.json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Server error" });
    }
});




router.post("/accept-request", async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove from pending/sent requests
        toUser.pendingRequests = toUser.pendingRequests.filter(
            (id) => id.toString() !== fromUserId
        );

        fromUser.sentRequests = fromUser.sentRequests.filter(
            (id) => id.toString() !== toUserId
        );

        // Add to friends list
        toUser.friends.push(fromUserId);
        fromUser.friends.push(toUserId);

        await toUser.save();
        await fromUser.save();

        res.json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting request:", error);
        res.status(500).json({ message: "Server error" });
    }
});




router.post("/deny-request", async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;


        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "User not found" });
        }


        toUser.pendingRequests = toUser.pendingRequests.filter(
            (id) => id.toString() !== fromUserId
        );
        fromUser.sentRequests = fromUser.sentRequests.filter(
            (id) => id.toString() !== toUserId
        );

        await toUser.save();
        await fromUser.save();

        res.json({ message: "Friend request denied" });
    } catch (error) {
        console.error("Error denying request:", error);
        res.status(500).json({ message: "Server error" });
    }
});




export default router;
