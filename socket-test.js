const { io } = require('socket.io-client');

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OGY5NGNlNy1kZWM0LTQ3NjktODk2OS05MjJiMWFlMzc4MTIiLCJ1c2VybmFtZSI6ImFsaWNldGVzdGluZyIsImlhdCI6MTc4OTYyNzYzNCwiZXhwIjoxNzg5NjI4NTM0fQ.ajrsUlNOVzlgpvqsCfUqrjYWy6qhHPC3WDG02GX1QR0';



const socket = io('http://localhost:4000', {
  auth: {
    token: accessToken,
  },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  const requestId = crypto.randomUUID();
  console.log(requestId)
  socket.emit('room.join', {
    type: 'room.join',
    requestId,
    timestamp: Date.now(),
    payload: {
      roomId: 'a4a36ec8-472d-4af4-a1b1-21d85c2caf29',
    },
  });
});

socket.on('connection.ready', (event) => {
  console.log('Server says:', event);
});

socket.on('room.joined', (event) => {
  console.log('Room joined:', event);
});

socket.on('room.user_joined', (event) => {
  console.log('User joined room:', event);
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (event) => {
  console.log('Server error:', event);
});

socket.on('presence.changed', (event) => {
  console.log('presencechanged:', event);
});