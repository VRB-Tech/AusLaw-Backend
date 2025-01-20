import { Body, Controller, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  async createPaymentIntent(@Body('amount') amount: number, @Body('currency') currency: string) {
    if (!amount || !currency) {
      throw new HttpException('Amount and currency are required', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(amount) || amount <= 0) {
      throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
    }

    if (!['usd', 'eur'].includes(currency.toLowerCase())) {
      throw new HttpException('Not allowed currency', HttpStatus.BAD_REQUEST);
    }

    return await this.paymentService.createPaymentIntent(amount, currency);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = this.paymentService.verifyWebhookSignature(req.body, sig);
    } catch (err) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    try {
      await this.paymentService.handleWebhook(event);
    } catch (err) {
      console.error('Error processing webhook:', err.message);
    }

    res.status(200).json({ received: true });
  }
}
