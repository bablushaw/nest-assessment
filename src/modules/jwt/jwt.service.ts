import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtVerifyResponseDto } from './dto/jwt.dto';

@Injectable()
export class JwtService {
  private readonly validToken: string;

  constructor(private readonly configService: ConfigService) {
    this.validToken = this.configService.get<string>('jwt.validToken')!;
  }

  /**
   * Verify JWT token
   * @param authorizationToken Bearer token from Authorization header
   * @returns Authorization result
   */
  async verifyToken(authorizationToken?: string): Promise<JwtVerifyResponseDto> {
    const token = authorizationToken || '';

    const isValid =
      token === `Bearer ${this.validToken}` || token === this.validToken;

    if (isValid) {
      console.log('Authorization successful');
      return {
        isAuthorized: true,
      };
    } else {
      console.log('Authorization failed - invalid token');
      throw new UnauthorizedException({
        isAuthorized: false,
      });
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | undefined {
    if (!authHeader) {
      return undefined;
    }

    // Handle "Bearer token" format
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authHeader;
  }
}
