import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

interface AccessTokenPayload {
  sub: string;
  username: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake.auth?.token;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException(
        'Missing WebSocket authentication token',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(
          token,
        );

      client.data.user = {
        userId: payload.sub,
        username: payload.username,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired WebSocket token',
      );
    }
  }
}