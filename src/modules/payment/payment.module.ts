import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeModule } from './../../stripe/stripe.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [ConfigModule, StripeModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
