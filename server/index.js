import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import {
    userJoin,
    getCurrentUser,
    userLeave,
    getGroupUsers,
    botName
} from './utils.js'

const app = express() // create express app
const PORT = 3001;

const server = createServer(app) // create http server

const io = new Server(server, { // create socket.io server
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
})

io.on("connection", (socket) => {
    socket.on("joinRoom", (payload) => {
        const user = userJoin({ ...payload, id: socket.id });
        socket.join(user.room); // when user join room push user to users
        console.log("IN Join Room Event");
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            );

        io.to(user.room).emit("roomUsers", { // emiting room users
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    socket.on('chatMessage', (msg) => { // when user send message emit message

        const user = getCurrentUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, msg))
        }

    })
    socket.on("disconnect", () => { // when user disconnect remove user from users
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});


server.listen(PORT, () => { // start server
    console.log("Server is running");
});