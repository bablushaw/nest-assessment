import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RetryWeatherRequestDto {
  @ApiProperty({
    description: 'City name',
    example: 'London',
  })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  city: string;
}

export class RetryWeatherResponseDto {
  @ApiProperty({
    description: 'City name',
    example: 'London',
  })
  city: string;

  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 12,
  })
  temp: number;

  @ApiProperty({
    description: 'Weather conditions',
    example: 'Rainy',
  })
  conditions: string;
}
