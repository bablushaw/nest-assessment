import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'auth.mockEmail': 'user@example.com',
      'auth.mockPassword': 'Password123',
      'auth.mockToken': 'mockToken123',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return success response for valid credentials', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'Password123',
      };

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mockToken123');
    });

    it('should throw BadRequestException for invalid email (no @)', async () => {
      const loginDto = {
        email: 'invalid-email',
        password: 'Password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for password less than 8 characters', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'short',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty email', async () => {
      const loginDto = {
        email: '',
        password: 'Password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty password', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: '',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });
});
