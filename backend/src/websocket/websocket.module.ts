import { Module } from '@nestjs/common';
import { RealtimeWebSocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'orto-whave-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [RealtimeWebSocketGateway],
  exports: [RealtimeWebSocketGateway],
})
export class WebSocketModule {}
