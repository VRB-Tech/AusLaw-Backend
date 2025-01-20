import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');

  const sequelize = app.get(Sequelize);

  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  await sequelize.sync({ alter: true });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port || 3000}`);
}
bootstrap();
