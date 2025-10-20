import express from "express";
import Message from "../models/Message.js";


const router = express.Router();


router.get("/", async (req, res) => {
    const { from, to } = req.query;
    try {
        const messages = await Message.find({
            $or: [
                { sender: from, receiver: to },
                { sender: to, receiver: from }

            ]
        }).sort({ createdAt: 1 }).select("sender receiver text createdAt");
        res.json(messages);
    } catch (err) {
        console.log(err);
    }
});

export default router;