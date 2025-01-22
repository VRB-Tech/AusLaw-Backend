import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const sequelize = app.get(Sequelize);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');

  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();

  await sequelize.sync({ alter: true });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port || 3000}`);
}

main();
