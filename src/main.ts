import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const sequelize = app.get(Sequelize);

  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  await sequelize.sync({ alter: true });

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3000}`);
}

bootstrap();
