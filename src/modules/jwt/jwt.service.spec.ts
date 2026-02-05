import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service';

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.validToken': 'validToken123',
    };
    return config[key];
  }),
};

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should return isAuthorized: true for valid Bearer token', async () => {
      const result = await service.verifyToken('Bearer validToken123');
      expect(result.isAuthorized).toBe(true);
    });

    it('should return isAuthorized: true for valid token without Bearer', async () => {
      const result = await service.verifyToken('validToken123');
      expect(result.isAuthorized).toBe(true);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      await expect(service.verifyToken('Bearer invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for missing token', async () => {
      await expect(service.verifyToken()).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for empty token', async () => {
      await expect(service.verifyToken('')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = service.extractTokenFromHeader('Bearer validToken123');
      expect(token).toBe('validToken123');
    });

    it('should return token as-is if not Bearer format', () => {
      const token = service.extractTokenFromHeader('validToken123');
      expect(token).toBe('validToken123');
    });

    it('should return undefined for missing header', () => {
      const token = service.extractTokenFromHeader();
      expect(token).toBeUndefined();
    });
  });
});
