import { ApiProperty } from '@nestjs/swagger';

export interface JwtPayload {
  token: string;
}

export class JwtVerifyRequestDto {
  @ApiProperty({
    description: 'Authorization token (Bearer token)',
    example: 'Bearer validToken123',
    required: false,
  })
  authorization?: string;
}

export class JwtVerifyResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if token is authorized',
  })
  isAuthorized: boolean;
}
