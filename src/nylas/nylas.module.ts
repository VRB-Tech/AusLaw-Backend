import { Module } from '@nestjs/common';
import { NylasService } from './nylas.service';
import { NylasController } from './controllers/nylas.controller';
import { ConfigModule } from '@nestjs/config';
import { NylasWebhookController } from './controllers/webhook.controller';

@Module({
  imports: [ConfigModule],
  providers: [NylasService],
  controllers: [NylasController, NylasWebhookController],
})
export class NylasModule {}
