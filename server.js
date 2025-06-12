const express = require('express');
    const {createServer} = require('http');
    const {Server} = require('socket.io');
    const app = express();
    const httpSetcer = createServer(app);
    const io  = new Server(Http2ServerRequest, { cors:{ origin: '*'}});

    const romms = new Map();
    io.on('connection', (scoket) =>{
        Socket.on('joinRomm', (roomId)=>{
            socket.join(roomId);
            if(!rooms.has(roomId)) rooms.set(roomId, []);
            rooms.get(roomId).push(socket.id);
            io.to(roomId).emit('playerJoined',socket.id);
        });
        socket.on('move', (data) =>{
            io.to(roomId).emit('playerMove',data);
            if (data.task) io.to(roomId).emit('taskTrigger',data.task);

        });
        setInterval(() => socket.emit('ping'),30000);
    });
    httpSetcer.listen(3000, () => console.log('Server running on port 3000'));