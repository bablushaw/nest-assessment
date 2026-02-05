import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RetryController } from './retry.controller';
import { RetryService } from './retry.service';

@Module({
  imports: [HttpModule],
  controllers: [RetryController],
  providers: [RetryService],
  exports: [RetryService],
})
export class RetryModule {}
