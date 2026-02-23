# 🚀 Collaborative Chat & Code Platform 💻💬

A powerful, real-time collaboration tool that combines a **monaco-based code editor** with a **private & room-based chat system**. Built with the MERN stack and Socket.io for seamless, instantaneous communication.

---

## 🔗 Live Demo
🌐 **Frontend:** [https://chat-frontend-oo3x.onrender.com/home](https://chat-frontend-oo3x.onrender.com/home)  
⚙️ **Backend:** [https://chat-backend-vb30.onrender.com/](https://chat-backend-vb30.onrender.com/)

> [!IMPORTANT]
> **Cold Start Alert:** If you are accessing the live links, please open the **Backend** first and wait for **2 to 3 minutes** until "Hello World" appears. This is due to Render's free tier spin-up time. Once the backend is awake, the frontend will function perfectly! ⏳

---

## ✨ Key Features

*   **🔐 Secure Authentication**: Integrated with **JWT (JSON Web Tokens)** and managed by **Redux Toolkit** for a persistent and secure user session.
*   **🤝 Real-time Code Collaboration**: Multiple users can edit code simultaneously in a professional-grade Monaco Editor.
*   **💬 Multi-channel Chat**:
    *   **Room Chat**: Discuss within specific project rooms.
    *   **Private Messaging**: direct 1-to-1 chats with other registered users.
*   **🔔 Interactive Notifications**: Get real-time alerts for room invites and private messages.
*   **🎨 Modern UI**: Built with **Tailwind CSS** for a sleek, responsive, and "glassmorphism" inspired design.

---

## 🛠️ Tech Stack

### Frontend 📱
*   **React 19**: Modern UI framework.
*   **Redux Toolkit**: Centralized state management for auth and user data.
*   **Tailwind CSS**: Utility-first styling for a premium look.
*   **Monaco Editor**: The powerhouse behind VS Code, integrated for the best coding experience.
*   **Socket.io-client**: real-time bidirectional communication.
*   **React Router**: Clean and efficient client-side routing.

### Backend ⚙️
*   **Node.js & Express**: Fast and scalable server-side environment.
*   **MongoDB & Mongoose**: Flexible NoSQL database for users, messages, and room data.
*   **Socket.io**: Real-time engine for chats and code syncing.
*   **JWT**: Industry-standard secure authentication.
*   **Bcrypt.js**: High-security password hashing.

---

## 🚀 Local Installation & Setup

Want to run this project on your own machine? Follow these steps:

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd <project-folder>
```

### 2. Backend Setup 🛠️
*   Navigate to the `backend` folder.
*   Install dependencies: `npm install`.
*   **Environment Variables**: Create a `.env` file in the backend root:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    ```
*   **IMPORTANT**: In `app.js`, ensure the CORS origin matches your frontend local URL:
    ```javascript
    origin: "http://localhost:5173"
    ```
*   Start the server: `npm run dev`.

### 3. Frontend Setup 💻
*   Navigate to the `frontend` folder.
*   Install dependencies: `npm install`.
*   **Environment Variables**: Create a `.env` file in the frontend root:
    ```env
    VITE_API_URL=http://localhost:3000
    ```
*   Start the development server: `npm run dev`.

---

## 📖 How it Works

1.  **Authentication**: Users sign up/log in. Passwords are encrypted before being stored. A JWT token is generated and stored in the browser (and Redux state) to keep you logged in. 🔑
2.  **Rooms**: Create or join a room. Each room has a unique ID. 🏠
3.  **Collaborative Editing**: As you type in the editor, `socket.emit` sends the changes to the server, which broadcasts them to everyone else in the same room. 🛰️
4.  **Chat system**: Messages are saved in MongoDB so you never lose history, but delivered instantly via Sockets for that real-time feel. 📨

---
