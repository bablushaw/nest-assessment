import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../modules/jwt/jwt.service';
import { JwtPayload } from '../../modules/jwt/dto/jwt.dto';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers?.authorization;

    try {
      await this.jwtService.verifyToken(authorization);
      const token = this.jwtService.extractTokenFromHeader(authorization);
      (request as Request & { user: JwtPayload }).user = { token: token ?? '' };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({ isAuthorized: false });
    }
  }
}
