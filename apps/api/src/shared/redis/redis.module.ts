import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { createClient } = await import('redis');
        const client = createClient({
          socket: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
            tls: configService.get('redis.tls', false),
          },
          password: configService.get('redis.password') || undefined,
          database: configService.get('redis.db', 0),
        });
        await client.connect();
        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
