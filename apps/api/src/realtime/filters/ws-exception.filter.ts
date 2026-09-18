import {
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import {
  BaseWsExceptionFilter,
} from '@nestjs/websockets';

import type { Socket } from 'socket.io';

interface IncomingEvent {
  requestId?: string;
}

@Catch()
export class WsExceptionFilter
  extends BaseWsExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const client =
      host.switchToWs().getClient<Socket>();

    const data =
      host.switchToWs().getData<IncomingEvent>();

    client.emit('error', {
      type: 'error',
      requestId: data?.requestId,
      timestamp: Date.now(),
      payload: {
        code: 'ROOM_JOIN_FAILED',
        message: 'Unable to join room',
      },
    });
  }
}