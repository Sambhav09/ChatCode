import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserCodeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    code: { type: String, required: true },
}, { timestamps: true });

// Ensure efficient searching and unique entries per user per room
UserCodeSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.model("UserCode", UserCodeSchema);
