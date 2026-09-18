import { 
    Injectable, 
    ForbiddenException,
    NotFoundException,
    ConflictException 
    } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddRoomMemberDto } from './dto/add-room-member.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateRoomDto,
  ) {
    const name = dto.name.trim();

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          name,
          ownerId: userId,
        },
      });

      await tx.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role: 'OWNER',
        },
      });

      return room;
    });
  }

  async findMyRooms(userId: string) {
    const memberships = await this.prisma.roomMember.findMany({
      where: {
        userId,
      },
      include: {
        room: true,
      },
      orderBy: {
        room: {
          updatedAt: 'desc',
        },
      },
    });

    return memberships.map((membership) => ({
      id: membership.room.id,
      name: membership.room.name,
      ownerId: membership.room.ownerId,
      role: membership.role,
      createdAt: membership.room.createdAt,
      updatedAt: membership.room.updatedAt,
    }));
  }

  async findOne(roomId: string, userId: string){
    const membership = await this.prisma.roomMember.findUnique({
        where: {
            roomId_userId: {
                roomId,
                userId
            }
        },
        include: {
            room : {
                include: {
                    members: {
                        include:{
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if(!membership){
        const room = await this.prisma.room.findUnique({
            where:{
                id: roomId
            },
            select:{
                id: true
            }
        })

        if(!room){
            throw new NotFoundException('Room not found')
        }

        throw new ForbiddenException('You are not member of this room')
    }

    return {
        id: membership.room.id,
        name: membership.room.name,
        ownerId: membership.room.ownerId,
        role: membership.role,
        createdAt: membership.room.createdAt,
        updatedAt: membership.room.updatedAt,
        members: membership.room.members.map((member) => (
            {   id: member.user.id, 
                username: member.user.username, 
                avatarUrl: member.user.avatarUrl, 
                role: member.role, 
                joinedAt: member.joinedAt, 
            })),
    }

  }

  async addMember(roomId: string, requesterId: string, dto: AddRoomMemberDto){

    const requester = await this.prisma.roomMember.findUnique({
        where: {
            roomId_userId : {
                roomId,
                userId: requesterId
            }
        }
    })

    if(!requester){{
        throw new ForbiddenException('You are not member of this room')
    }}

    if(requester.role != 'ADMIN' && requester.role != 'OWNER'){
        throw new ForbiddenException('You dont have permission to add members')
    }

    const username = dto.username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique(
        { where: { username, }, 
    });

    if (!user) { throw new NotFoundException('User not found'); }

    try { 
        const membership = await this.prisma.roomMember.create(
            { data: { 
                roomId, 
                userId: user.id, 
                role: 'MEMBER', 
            }, 
            include: { 
                user:
                 { select: 
                    { 
                        id: true, 
                        username: true, 
                        avatarUrl: true, 
                    }, 
                }, 
            }, 
        }); 
        
        return { 
            id: membership.user.id, 
            username: membership.user.username, 
            avatarUrl: membership.user.avatarUrl, 
            role: membership.role, 
            joinedAt: membership.joinedAt, 
        }; 
    } catch (error) { 
        if ( error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002' ) { throw new ConflictException( 'User is already a member of this room', ); 

        } 
        throw error; 
    }

  }

  async update(
    roomId: string,
    requesterId: string,
    dto: UpdateRoomDto,
    ) {
    const membership =
        await this.prisma.roomMember.findUnique({
        where: {
            roomId_userId: {
            roomId,
            userId: requesterId,
            },
        },
        });

    if (!membership) {
        throw new ForbiddenException(
        'You are not a member of this room',
        );
    }

    if (
        membership.role !== 'OWNER' &&
        membership.role !== 'ADMIN'
    ) {
        throw new ForbiddenException(
        'You do not have permission to rename this room',
        );
    }

    const name = dto.name.trim();

    return this.prisma.room.update({
        where: {
        id: roomId,
        },
        data: {
        name,
        },
    });
    }

  async removeMember(
    roomId: string,
    requesterId: string,
    targetUserId: string,
    ) {
    if (requesterId === targetUserId) {
        throw new ForbiddenException(
        'You cannot remove yourself from the room',
        );
    }

    const requester =
        await this.prisma.roomMember.findUnique({
        where: {
            roomId_userId: {
            roomId,
            userId: requesterId,
            },
        },
        });

    if (!requester) {
        throw new ForbiddenException(
        'You are not a member of this room',
        );
    }

    const target =
        await this.prisma.roomMember.findUnique({
        where: {
            roomId_userId: {
            roomId,
            userId: targetUserId,
            },
        },
        });

    if (!target) {
        throw new NotFoundException(
        'User is not a member of this room',
        );
    }

    if (requester.role === 'MEMBER') {
        throw new ForbiddenException(
        'You do not have permission to remove members',
        );
    }

    if (
        requester.role === 'ADMIN' &&
        target.role !== 'MEMBER'
    ) {
        throw new ForbiddenException(
        'Admins can only remove members',
        );
    }

    await this.prisma.roomMember.delete({
        where: {
        roomId_userId: {
            roomId,
            userId: targetUserId,
        },
        },
    });

    return {
        message: 'Member removed successfully',
    };
    }
}

