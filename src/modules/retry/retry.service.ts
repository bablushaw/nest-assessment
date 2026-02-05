import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { RetryWeatherRequestDto, RetryWeatherResponseDto } from './dto/retry.dto';
import { retryCallApi } from '../../shared/utils/retry.util';

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
export class RetryService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('weather.apiKey')!;
    this.apiUrl = this.configService.get<string>('weather.apiUrl')!;
  }

  /**
   * Fetch weather data with retry mechanism
   * @param params City name
   * @returns Weather data with temperature in Celsius
   */
  async getWeatherWithRetry(params: RetryWeatherRequestDto): Promise<RetryWeatherResponseDto> {
    const { city } = params;

    // Call weather API with retry mechanism
    const apiUrl = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}`;
    console.log(`Fetching weather for city: ${city}`);

    let apiResponse: { data: WeatherApiResponse };
    
    try {
      // Retry with exponential backoff: 1s → 2s
      apiResponse = await retryCallApi(
        async () => {
          const response = await axios.get<WeatherApiResponse>(apiUrl, {
            timeout: 5000,
          });
          return response;
        },
        {
          maxRetries: 2,
          initialDelayMs: 1000, // Start with 1 second
        }
      );
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

    // Transform API response
    const weatherData = apiResponse.data;
    const tempKelvin = weatherData.main.temp;
    const tempCelsius = Math.round(tempKelvin - 273.15);
    const conditions = weatherData.weather[0]?.main || 'Unknown';

    const result: RetryWeatherResponseDto = {
      city: weatherData.name,
      temp: tempCelsius,
      conditions,
    };

    console.log(`Successfully fetched weather for ${city}:`, result);

    return result;
  }
}
