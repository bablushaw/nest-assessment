import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 *
 * This injectable service class encapsulates interactions with a Redis cache.
 * The default scope is 'singleton' : this means that there will be a single instance
 * of the service created when the application starts up,
 * and that instance will be used for all requests that require the CacheService.
 *
 * @export
 * @class CacheService
 */
@Injectable()
export class CacheService {
  // initialize client instance variable
  private readonly client: Redis;

  // initialize logging instance variable
  private readonly logger = new Logger(CacheService.name);

  /**
   *
   * Creates an instance of CacheService.
   * @param {ConfigService} configService
   * @memberof CacheService
   */
  constructor(private readonly configService: ConfigService) {
    // Retrieve the Redis host, port, and password from the application configuration.
    const host = this.configService.get('cache.host');
    const port = this.configService.get('cache.port');
    const password = this.configService.get('cache.password');

    // Create a new Redis client instance with the specified host, port, and password.
    this.client = new Redis({ host, port, password });

    // Add an event listener for the "connect" event, which is emitted when the client successfully connects to Redis.
    this.client.on('connect', () => {
      const successMessage = `successfully connected to redis at ${host}:${port}`;
      this.logger.log(successMessage);
    });

    // Add an event listener for the "error" event, which is emitted when the client encounters an error.
    this.client.on('error', (err) => {
      const errorMessage = `Error Connecting to redis ${err}`;
      this.logger.error(errorMessage);
    });
  }

  /**
   * Get the value associated with the specified key from the Redis cache.
   *
   * @param {string} key
   * @returns {Promise<string>}
   * @memberof CacheService
   */
  async get(module: string, key: string): Promise<string> {
    const value = await this.client.get(`${module}${key}`);
    if (!value) {
      throw new NotFoundException(`Value not found for key ${key}`);
    }
    return value;
  }

  /**
   * Set the value associated with the specified key in the Redis cache.
   *
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   * @memberof CacheService
   */
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * Set the value associated with the specified key in the Redis cache with an expiry time in seconds.
   *
   * @param {string} key
   * @param {string} value
   * @param {number} expiry
   * @returns {Promise<void>}
   * @memberof CacheService
   */
  async setWithExpiry(key: string, value: string, expiry: number): Promise<void> {
    await this.client.set(key, value, 'EX', expiry);
  }
}
