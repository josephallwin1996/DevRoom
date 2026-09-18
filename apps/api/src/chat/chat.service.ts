import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createMessage(
    roomId: string,
    senderId: string,
    content: string,
  ) {

    return this.prisma.message.create({
      data: {
        roomId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

async findMessages(
  roomId: string,
  limit = 50,
  before?: string,
) {
  let beforeMessage: {
    createdAt: Date;
    id: string;
  } | undefined;

  if (before) {
    const message = await this.prisma.message.findUnique({
      where: { id: before },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (message) {
      beforeMessage = message;
    }
  }

  return this.prisma.message.findMany({
    where: {
      roomId,
      ...(beforeMessage
        ? {
            OR: [
              {
                createdAt: {
                  lt: beforeMessage.createdAt,
                },
              },
              {
                createdAt: beforeMessage.createdAt,
                id: {
                  lt: beforeMessage.id,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
}
}