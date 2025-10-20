import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import { createServer } from 'http'
import authRoutes from './routes/auth.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user.js'
import roomRoutes from './routes/room.js'
import Message from './models/Message.js'
import MessageRoute from './routes/message.js'



const app = express()

dotenv.config()

let users = {};


app.use(cors(
    {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
        credentials: true
    }
))


const server = createServer(app);

console.log("mongodb ur;", process.env.MONGO_URI)


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", MessageRoute);



const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log('a user connected', socket.id)

    socket.on("register", (userId) => {
        users[userId] = socket.id;

    }
    )

    socket.on("join-room", ({ roomId, userId }) => {
        console.log(`User ${userId} joined room: ${roomId}`)
        socket.join(roomId)
    })

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", { code })

    })

    socket.on("chat-message", async ({ roomId, message, sender, userId }) => {
        socket.to(roomId).emit("new-message", { sender, message })
        const newMessage = new Message({
            sender: userId,
            senderName: sender,
            room: roomId,
            text: message,

        })
        await newMessage.save();
    })

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
    })

    socket.on('private message', async ({ from, to, message }) => {
        console.log("privzte messages is", message)
        const newMessage = new Message({
            sender: from,
            receiver: to,
            text: message,
        })
        await newMessage.save();
        if (users[to]) {
            io.to(users[to]).emit('private message', {
                from,
                message
            });
        }
    });


    socket.on("message", (data) => {
        console.log(data)
        io.emit("recieve-message", data)

    })
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})