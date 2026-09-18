import { Module } from '@nestjs/common';

import { RoomsModule } from '../rooms/rooms.module';
import { RealtimeGateway } from './realtime.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { PresenceModule } from './presence/presence.module';

@Module({
  imports: [RoomsModule, ChatModule, PresenceModule],
  providers: [RealtimeGateway],
})
export class RealtimeModule {}