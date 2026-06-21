import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockConfigService.getOrThrow.mockReturnValue('secret');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@test.com', password: 'password123', firstName: 'John', lastName: 'Doe' };
      mockUserService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserService.create.mockResolvedValue({ id: 1, ...dto, password: 'hashedPassword' });
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRT');

      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      const dto = { email: 'test@test.com', password: 'password123', firstName: 'John', lastName: 'Doe' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRT');

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const dto = { email: 'test@test.com', password: 'wrongpassword' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      mockUserService.findById.mockResolvedValue({ id: 1, email: 'test@test.com', refreshToken: 'hashedRT' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('newAccessToken').mockResolvedValueOnce('newRefreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRT');

      const result = await service.refreshTokens(1, 'refreshToken');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no refresh token stored', async () => {
      mockUserService.findById.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(service.refreshTokens(1, 'token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(1);
      expect(mockUserService.updateRefreshToken).toHaveBeenCalledWith(1, null);
    });
  });
});
