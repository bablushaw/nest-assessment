import { Controller, Post, Headers, HttpCode, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from './jwt.service';
import { JwtGuard } from '../../shared/guards/jwt.guard';
import { GetCurrentUser } from '../../shared/decorators/get-current-user.decorator';
import { type JwtPayload, JwtVerifyResponseDto } from './dto/jwt.dto';

@ApiTags('jwt')
@Controller('jwt')
export class JwtController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('verify')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify JWT token',
    description: 'Checks Authorization header for Bearer token. Returns { isAuthorized: true } if token is "validToken123", otherwise returns { isAuthorized: false }',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Token verification successful',
    type: JwtVerifyResponseDto,
  })
  async verifyToken(
    @GetCurrentUser() jwtPayload: JwtPayload,
  ): Promise<JwtVerifyResponseDto> {
    try {
      console.log('jwtPayload', jwtPayload);
      return await this.jwtService.verifyToken(jwtPayload.token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        isAuthorized: false,
      });
    }
  }
}
