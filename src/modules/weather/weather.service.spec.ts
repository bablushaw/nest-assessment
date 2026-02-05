import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, HttpException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { weatherCache } from '../../shared/utils/cache.util';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'weather.apiKey': 'mock_key',
      'weather.apiUrl': 'https://api.openweathermap.org/data/2.5/weather',
    };
    return config[key];
  }),
};

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WeatherService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    weatherCache.clear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for valid city', async () => {
      const mockApiResponse = {
        data: {
          name: 'London',
          main: {
            temp: 285.15, // 12°C
          },
          weather: [
            {
              main: 'Rainy',
              description: 'light rain',
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      const result = await service.getWeather({ city: 'London' });

      expect(result.city).toBe('London');
      expect(result.temp).toBe(12);
      expect(result.conditions).toBe('Rainy');
    });

    it('should return cached response if available', async () => {
      // Set cache
      weatherCache.set('london', {
        city: 'London',
        temp: 15,
        conditions: 'Sunny',
      });

      const result = await service.getWeather({ city: 'London' });

      expect(result.city).toBe('London');
      expect(result.temp).toBe(15);
      expect(result.conditions).toBe('Sunny');
      // Should not call API when cache hit
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for city not found (404)', async () => {
      const axiosError = {
        response: {
          status: 404,
        },
      };
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(service.getWeather({ city: 'InvalidCity123' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw HttpException for rate limit (429)', async () => {
      const axiosError = {
        response: {
          status: 429,
        },
      };
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(service.getWeather({ city: 'London' })).rejects.toThrow(HttpException);
    });
  });
});
