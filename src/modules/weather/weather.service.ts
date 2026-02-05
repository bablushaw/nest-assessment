import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { WeatherRequestDto, WeatherResponseDto } from './dto/weather.dto';

interface WeatherApiResponse {
  name: string;
  main: {
    temp: number; // Kelvin
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('weather.apiKey')!;
    this.apiUrl = this.configService.get<string>('weather.apiUrl')!;
  }

  /**
   * Fetch weather data for a city
   * @param weatherRequest City name
   * @returns Weather data with temperature in Celsius
   */
  async getWeather(weatherRequest: WeatherRequestDto): Promise<WeatherResponseDto> {
    const { city } = weatherRequest;
    // Call weather API
    const apiUrl = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}`;
    console.log(`Fetching weather for city: ${city}`);

    try {
      const response = await axios.get<WeatherApiResponse>(apiUrl, {
        timeout: 5000, // 5 second timeout
      });

      // Transform API response
      const weatherData = response.data;
      const tempKelvin = weatherData.main.temp;
      const tempCelsius = Math.round(tempKelvin - 273.15); // Convert Kelvin to Celsius
      const conditions = weatherData.weather[0]?.main || 'Unknown';

      const result: WeatherResponseDto = {
        city: weatherData.name,
        temp: tempCelsius,
        conditions,
      };
      return result;
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle 404 (city not found) - don't retry
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`City "${city}" not found`);
      }

      // Handle rate limits (429) - don't retry
      if (axiosError.response?.status === 429) {
        throw new HttpException('Rate limit exceeded. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }

      // Handle other API errors after retries exhausted
      throw new HttpException('Failed to fetch weather data after retries', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
