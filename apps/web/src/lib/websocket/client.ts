import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export function createSocket(
  accessToken: string,
): Socket {
  return io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },
    autoConnect: false,
  });
}