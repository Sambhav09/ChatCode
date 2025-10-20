// models/Room.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    code: { type: String, default: "console.log('Hello world')" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Room", RoomSchema);
