import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F97316' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Shopping', color: '#EC4899' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Bills', color: '#EF4444' },
  { name: 'Healthcare', color: '#10B981' },
  { name: 'Education', color: '#F59E0B' },
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  private async generateToken(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
    });

    const token = await this.generateToken(user.id, user.email);
    return { user: this.sanitize(user), accessToken: token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.generateToken(user.id, user.email);
    return { user: this.sanitize(user), accessToken: token };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitize(user);
  }
}
