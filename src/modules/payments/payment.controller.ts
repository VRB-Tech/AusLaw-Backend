import { Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(@Req() request: Request, @Headers('stripe-signature') signature: string) {
    const rawBody = request.body;

    try {
      const event = await this.paymentService.handleWebhook(rawBody, signature);

      return { received: event };
    } catch (error) {
      return { error: 'Webhook handler failed' };
    }
  }
}
