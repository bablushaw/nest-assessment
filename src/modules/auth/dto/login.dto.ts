import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '../validators/password.validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'Password123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @IsStrongPassword({
    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if login was successful',
  })
  success: true;

  @ApiProperty({
    example: 'mockToken123',
    description: 'Authentication token',
  })
  token: string;
}
