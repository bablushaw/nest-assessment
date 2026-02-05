import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RetryService } from './retry.service';
import { RetryWeatherRequestDto, RetryWeatherResponseDto } from './dto/retry.dto';

@ApiTags('retry')
@Controller('retry')
export class RetryController {
  constructor(private readonly retryService: RetryService) {}

  @Post('weather')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get weather data with retry mechanism',
    description: 'Fetches weather data from OpenWeatherMap API with retry mechanism. Retries failed API calls 2 times with exponential backoff (1s → 2s). Responses are cached for 1 minute.',
  })
  @ApiBody({
    type: RetryWeatherRequestDto,
    description: 'City name',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather data retrieved successfully',
    type: RetryWeatherResponseDto,
  })
  async getWeatherWithRetry(@Body() params: RetryWeatherRequestDto): Promise<RetryWeatherResponseDto> {
    return this.retryService.getWeatherWithRetry(params);
  }
}
