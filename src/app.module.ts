import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WeatherModule } from './modules/weather/weather.module';
import { RetryModule } from './modules/retry/retry.module';
import { JwtModule } from './modules/jwt/jwt.module';
import envConfigs from './config/environment/configuration.environment';
import { CacheModule } from './shared/preprocessor/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfigs],
    }),
    AuthModule,
    WeatherModule,
    RetryModule,
    JwtModule,
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
