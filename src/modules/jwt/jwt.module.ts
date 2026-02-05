import { Module } from '@nestjs/common';
import { JwtController } from './jwt.controller';
import { JwtService } from './jwt.service';
import { JwtGuard } from '../../shared/guards/jwt.guard';

@Module({
  controllers: [JwtController],
  providers: [JwtService, JwtGuard],
  exports: [JwtService, JwtGuard],
})
export class JwtModule {}
