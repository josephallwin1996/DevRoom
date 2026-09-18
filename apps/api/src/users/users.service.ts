import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async findByEmail(email:string){
        return await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });
    }

    async getUserByname(username:string){
        return await this.prisma.user.findUnique({
            where: {
                username: username
            }
        })
    }

    async createUser(data: {
            email: string;
            username: string;
            passwordHash: string;
  }) {
    return this.prisma.user.create({
      data,
    });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: {
            id,
            },
            select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
            createdAt: true,
            },
        });
    }
}
