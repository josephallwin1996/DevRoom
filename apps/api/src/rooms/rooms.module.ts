import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports:[ChatModule],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports:[RoomsService]
})
export class RoomsModule {}
