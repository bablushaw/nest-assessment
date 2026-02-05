import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherRequestDto, WeatherResponseDto } from './dto/weather.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get weather data for a city',
    description: 'Fetches weather data from OpenWeatherMap API. Responses are cached for 1 minute. Temperature is converted from Kelvin to Celsius.',
  })
  @ApiBody({
    type: WeatherRequestDto,
    description: 'City name',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather data retrieved successfully',
    type: WeatherResponseDto,
  })
  async getWeather(@Body() weatherRequest: WeatherRequestDto): Promise<WeatherResponseDto> {
    return this.weatherService.getWeather(weatherRequest);
  }
}
