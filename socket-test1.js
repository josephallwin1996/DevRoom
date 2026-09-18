const { io } = require('socket.io-client');

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Yjk1ZjM0OC1lZjVmLTQ3NWUtODVhNS03MDg2NDhmZDUzMzYiLCJ1c2VybmFtZSI6ImFsaWNlMiIsImlhdCI6MTc4OTYyNzg0NCwiZXhwIjoxNzg5NjI4NzQ0fQ.CW04L1D4oEVJfyYQWdanwIrIGyGP33ePPN2iA4_Qi_g';



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

socket.emit('chat.send', {
  type: 'chat.send',
  requestId: crypto.randomUUID(),
  timestamp: Date.now(),
  payload: {
    roomId: 'a4a36ec8-472d-4af4-a1b1-21d85c2caf29',
    content: 'Hello from Alice2!',
  },
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

socket.on('chat.send.ack', (event) => {
  console.log('Message acknowledged:', event);
});

socket.on('chat.message', (event) => {
  console.log('New chat message:', event);
});

socket.on('presence.snapshot', (event) => {
  console.log('presence snapshot', JSON.stringify(event));
});

socket.on('presence.changed', (event) => {
  console.log('presence snapshot', JSON.stringify(event));
});