import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';

import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from './filters/ws-exception.filter';

import { JwtService } from '@nestjs/jwt';
import { Socket , Server} from 'socket.io';

import { RoomsService } from '../rooms/rooms.service';
import { ChatService } from 'src/chat/chat.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { ClientEvent } from '@devroom/shared';
import { SendMessageDto } from 'src/chat/dto/send-message.dto';
import { PresenceService } from './presence/presence.service';

interface AccessTokenPayload {
  sub: string;
  username: string;
}

type JoinRoomEvent = ClientEvent<JoinRoomDto>;
type SendMessageEvent = ClientEvent<SendMessageDto>;



@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomsService: RoomsService,
    private readonly chatService: ChatService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(`WebSocket connection attempt: ${socket.id}`);

    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== 'string') {
      console.log(`WebSocket rejected: ${socket.id} - missing token`);
      socket.emit('error', {
        type: 'error',
        requestId: '',
        timestamp: Date.now(),
        payload: {
          code: 'MISSING_TOKEN',
          message: `WebSocket rejected: ${socket.id} - missing token`,
        },
      });
      socket.disconnect(true);
      return;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      socket.data.user = {
        userId: payload.sub,
        username: payload.username,
      };

      console.log(
        `WebSocket authenticated: ${socket.id} (${payload.username})`,
      );

      socket.emit('connection.ready', {
        type: 'connection.ready',
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        payload: {
          message: 'Connected to DevRoom realtime server',
          user: {
            id: payload.sub,
            username: payload.username,
          },
        },
      });
    } catch {
      console.log(`WebSocket rejected: ${socket.id} - invalid token`);
      socket.emit('error', {
        type: 'error',
        requestId: '',
        timestamp: Date.now(),
        payload: {
          code: 'CONNECTION_FAILED',
          message: `WebSocket rejected: ${socket.id} - invalid token`,
        },
      });
      socket.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const offlineUser = this.presenceService.remove(socket.id);
    console.log(`WebSocket disconnected: ${socket.id}`);
    if (!offlineUser) {
        return;
    }
    console.log( `User went offline: ${offlineUser.username}`);
    this.server
    .to(offlineUser.roomId)
    .emit('presence.changed', {
      type: 'presence.changed',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      payload: {
        roomId: offlineUser.roomId,
        user: {
          userId: offlineUser.userId,
          username: offlineUser.username,
        },
        status: 'offline',
      },
    });
  }

  @SubscribeMessage('room.join')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    //@MessageBody() dto: JoinRoomDto,
    @MessageBody() event: JoinRoomEvent,
  ) {
    const user = socket.data.user;

    const room = await this.roomsService.findOne(
      event.payload.roomId,
      user.userId,
    );

    // Get users who were already present.
    const existingPresence = this.presenceService.getRoomPresence(
      event.payload.roomId,
    );



    socket.join(event.payload.roomId);

    this.presenceService.setOnline({
        userId: user.userId,
        username: user.username,
        roomId: event.payload.roomId,
        socketId: socket.id,
        lastSeenAt: Date.now(),
    });

    const presence = this.presenceService.getRoomPresence(
        event.payload.roomId,
    );

    socket.emit('presence.snapshot', {
        type: 'presence.snapshot',
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        payload: {
            roomId: event.payload.roomId,
            users: presence.map((entry) => ({
            userId: entry.userId,
            username: entry.username,
            lastSeenAt: entry.lastSeenAt,
            })),
        },
    });

    // Tell existing users that this user is now online.
    socket
    .to(event.payload.roomId)
    .emit('presence.changed', {
      type: 'presence.changed',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      payload: {
        roomId: event.payload.roomId,
        user: {
          userId: user.userId,
          username: user.username,
        },
        status: 'online',
      },
    });


    socket.emit('room.joined', {
      type: 'room.joined',
      requestId: event.requestId,
      timestamp: Date.now(),
      payload: {
        roomId: event.payload.roomId,
      },
    });


    socket.to(room.id).emit('room.user_joined', {
      type: 'room.user_joined',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      payload: {
        roomId: event.payload.roomId,
        user: {
          id: user.userId,
          username: user.username,
        },
      },
    });

    return room;
  }

  @SubscribeMessage('chat.send')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() event: SendMessageEvent,
  ) {
    const user = socket.data.user;

    const room = await this.roomsService.findOne(
      event.payload.roomId,
      user.userId,
    );

    const message = await this.chatService.createMessage(
      event.payload.roomId,
      user.userId,
      event.payload.content.trim(),
    );

    socket.emit('chat.send.ack', {
      type: 'chat.send.ack',
      requestId: event.requestId,
      timestamp: Date.now(),
      payload: {
        messageId: message.id,
      },
    });

    // socket.to(event.payload.roomId).emit('chat.message', {
    //   type: 'chat.message',
    //   eventId: crypto.randomUUID(),
    //   timestamp: Date.now(),
    //   payload: {
    //     messageId: message.id,
    //     roomId: message.roomId,
    //     sender: message.sender,
    //     content: message.content,
    //     createdAt: message.createdAt,
    //   },
    // });

    this.server
  .to(event.payload.roomId)
  .emit('chat.message', {
    type: 'chat.message',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    payload: {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
    }
  });

    return;
  }
}
