import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {

    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existingEmail = await this.usersService.findByEmail(dto.email);

    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername =
      await this.usersService.getUserByname(username);

    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Temporary:
    // We will replace this with password hashing next.
    //const passwordHash = dto.password;
    const passwordHash = await argon2.hash(dto.password);

    try{
        const user = await this.usersService.createUser({
            email,
            username,
            passwordHash,   
        });

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
        };
    }
    catch (error) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new ConflictException(
            'Email or username is already registered',
            );
        }

        throw error;
    }
  }

  async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await argon2.verify(
            user.passwordHash,
            dto.password,
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            username: user.username,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            },
        };
    }
}