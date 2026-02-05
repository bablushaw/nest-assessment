import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Login validation
   * @param loginDto Login credentials
   * @returns Success response with token or error response
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const mockEmail = this.configService.get<string>('auth.mockEmail');
    const mockPassword = this.configService.get<string>('auth.mockPassword');
    const mockToken = this.configService.get<string>('auth.mockToken');

    if (email === mockEmail && password === mockPassword) {
      return {
        success: true,
        token: mockToken!,
      };
    }

    throw new BadRequestException('Invalid email or password');
  }
}
