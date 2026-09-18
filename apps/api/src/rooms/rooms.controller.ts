import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';
import { AddRoomMemberDto } from './dto/add-room-member.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ChatService } from 'src/chat/chat.service';
import { GetMessagesDto } from '../chat/dto/get-messages.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly chatService: ChatService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(
    @Req() request: Request,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(
      request.user.userId,
      dto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findMyRooms(@Req() request: Request) {
    return this.roomsService.findMyRooms(
      request.user.userId,
    );
  }

  @Get(':roomId')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('roomId') roomId : string,
    @Req() request: Request
  ){
    return this.roomsService.findOne(
        roomId,
        request.user.userId
    )
  }

  @Post(':roomId/members')
  @UseGuards(JwtAuthGuard) 
  async addMember(
    @Param('roomId') roomId: string, 
    @Req() request: 
    Request, @Body() dto: AddRoomMemberDto, 
  ) {
        return this.roomsService.addMember( roomId, request.user.userId, dto, );
    }

  @Patch(':roomId')
    @UseGuards(JwtAuthGuard)
    async updateRoom(
    @Param('roomId') roomId: string,
    @Req() request: Request,
    @Body() dto: UpdateRoomDto,
    ) {
    return this.roomsService.update(
        roomId,
        request.user.userId,
        dto,
    );
  }

  @Delete(':roomId/members/:userId')
    @UseGuards(JwtAuthGuard)
    async removeMember(
    @Param('roomId') roomId: string,
    @Param('userId') targetUserId: string,
    @Req() request: Request,
    ) {
    return this.roomsService.removeMember(
        roomId,
        request.user.userId,
        targetUserId,
    );
    }

  @Get(':roomId/messages')
  @UseGuards(JwtAuthGuard)
    async getMessages(
      @Param('roomId') roomId: string,
      @Query() query: GetMessagesDto,
      @Req() request: Request,
    ) {
      await this.roomsService.findOne(
        roomId,
        request.user.userId,
      );

      return this.chatService.findMessages(
        roomId,
        query.limit,
        query.before,);
  }
}
