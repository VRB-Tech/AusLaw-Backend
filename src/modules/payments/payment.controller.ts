import { BadRequestException, Controller, Param, Post, Req, Res } from '@nestjs/common';
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
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];

    if (!rawBody || !signature) {
      throw new BadRequestException('Missing rawBody or stripe-signature in the request');
    }

    try {
      await this.paymentService.handleWebhook(rawBody, signature as string);
    } catch (error) {
      console.error('Error handling webhook:', error.message);
    }
  }
}
