import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/modules/users/users.module';
import { NylasController } from './controllers/nylas.controller';
import { NylasWebhookController } from './controllers/webhook.controller';
import { NylasService } from './nylas.service';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [NylasService],
  controllers: [NylasController, NylasWebhookController],
})
export class NylasModule {}
