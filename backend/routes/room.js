import express from "express";
import Room from "../models/Room.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;

        console.log("Fetching rooms for userId:", userId);

        const rooms = await Room.find({ members: userId })
            .select("_id name createdAt")
            .lean();
        console.log("Rooms found:", rooms);
        // Format response if you want custom keys
        const formattedRooms = rooms.map((room) => ({
            roomId: room._id,
            roomName: room.name,
            createdAt: room.createdAt,
        }));

        res.json(formattedRooms);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.post("/create", async (req, res) => {
    try {
        const { name, createdBy, members } = req.body;
        const newRoom = new Room({ name, createdBy, members });
        await newRoom.save();
        res.json({ message: "Room created successfully" });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Server error" });
    }
})

export default router;

router.post("/add", async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        await Room.findByIdAndUpdate(roomId, {
            $addToSet: { members: userId }
        });
        res.json({ message: "User added to room successfully" });
    } catch (error) {
        console.error("Error adding user to room:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/save-code", async (req, res) => {
    try {
        const { roomId, code } = req.body;
        await Room.findByIdAndUpdate(roomId, {
            code: code
        });
        res.json({ message: "Code saved successfully" });
    } catch (error) {
        console.error("Error saving code:", error);
    }
})

router.get("/get-code", async (req, res) => {
    try {
        const { roomId } = req.query;
        const room = await Room.findById(roomId).select("code").lean();
        res.json({ code: room.code });
    } catch (error) {
        console.error("Error fetching code:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/get-messages", async (req, res) => {
    try {
        const { roomId } = req.query;

        const messages = await Message.find({ room: roomId })
            .populate("sender", "username")
            .sort({ createdAt: 1 })
            .lean();

        const formattedMessages = messages.map(msg => ({
            text: msg.text,
            sender: msg.sender?.username || "Unknown",
        }));

        console.log("Messages fetched for roomId", roomId, ":", formattedMessages);
        res.json(formattedMessages);

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }
});
