import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()
@Module({
  // Define that the CacheModule provides the CacheService
  providers: [CacheService],
  // Make the CacheService available for use in other modules
  exports: [CacheService],
})

// Define the CacheModule
export class CacheModule {}
