import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  async createPaymentIntent(
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('metadata') metadata?: Record<string, string>,
  ) {
    return await this.paymentService.createPaymentIntent(amount, currency, metadata);
  }

  @Post('webhook')
  async handleWebhook(@Req() request: Request, @Headers('stripe-signature') signature: string) {
    const rawBody = request.body;

    try {
      const event = await this.paymentService.handleWebhook(rawBody, signature);
      return { received: true };
    } catch (error) {
      return { error: 'Webhook handler failed' };
    }
  }
}
