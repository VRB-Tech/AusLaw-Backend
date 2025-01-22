import { Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('cancel/:userId')
  async cancelSubscription(@Param('userId') userId: number) {
    try {
      await this.paymentService.cancelSubscription(userId);
      return { message: `Subscription for user ${userId} has been canceled.` };
    } catch (error) {
      return { error: `Failed to cancel subscription for user ${userId}: ${error.message}` };
    }
  }

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
