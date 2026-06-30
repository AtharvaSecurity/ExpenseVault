import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      createMany: jest.fn(),
    },
  };
  const jwtMock = {
    signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.category.createMany.mockResolvedValue({ count: 7 });

    const result = await service.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mock.jwt.token');
    expect(result.user.email).toBe('test@example.com');
    expect((result.user as any).password).toBeUndefined();
  });
});
