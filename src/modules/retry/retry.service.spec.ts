import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, HttpException } from '@nestjs/common';
import { RetryService } from './retry.service';
import { retryCallApi } from '../../shared/utils/retry.util';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../shared/utils/retry.util');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRetry = retryCallApi as jest.MockedFunction<typeof retryCallApi>;

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'weather.apiKey': 'mock_key',
      'weather.apiUrl': 'https://api.openweathermap.org/data/2.5/weather',
    };
    return config[key];
  }),
};

describe('RetryService', () => {
  let service: RetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        RetryService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RetryService>(RetryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeatherWithRetry', () => {
    it('should return weather data successfully', async () => {
      const mockApiResponse = {
        data: {
          name: 'London',
          main: { temp: 285.15 },
          weather: [{ main: 'Rainy', description: 'light rain' }],
        },
      };

      mockedRetry.mockResolvedValueOnce(mockApiResponse);

      const result = await service.getWeatherWithRetry({ city: 'London' });

      expect(result.city).toBe('London');
      expect(result.temp).toBe(12);
      expect(result.conditions).toBe('Rainy');
      expect(mockedRetry).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException for 404', async () => {
      const axiosError = {
        response: { status: 404 },
      };
      mockedRetry.mockRejectedValueOnce(axiosError);

      await expect(service.getWeatherWithRetry({ city: 'InvalidCity' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw HttpException for rate limit', async () => {
      const axiosError = {
        response: { status: 429 },
      };
      mockedRetry.mockRejectedValueOnce(axiosError);

      await expect(service.getWeatherWithRetry({ city: 'London' })).rejects.toThrow(HttpException);
    });
  });
});
