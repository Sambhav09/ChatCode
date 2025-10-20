// models/Message.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    room: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    text: { type: String, required: true },
    attachments: [{ url: String, mime: String }], // optional
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);
