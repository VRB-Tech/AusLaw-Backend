import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  async createPaymentIntent(@Body() amount: number, currency: string) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new HttpException('Invalid amount for PaymentIntent', HttpStatus.BAD_REQUEST);
    }

    if (!currency || typeof currency !== 'string') {
      throw new HttpException('Invalid currency for PaymentIntent', HttpStatus.BAD_REQUEST);
    }

    try {
      const paymentIntent = await this.paymentService.createPaymentIntent(amount, currency);
      this.logger.log('PaymentIntent created successfully', paymentIntent);
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      this.logger.error('Error creating PaymentIntent', error.stack);
      throw new HttpException('Failed to create PaymentIntent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      this.logger.error('Missing Stripe signature in headers');
      return res.status(400).send('Missing Stripe signature in headers');
    }

    let event;

    try {
      event = this.paymentService.verifyWebhookSignature(req.body, sig);
      this.logger.log(`Webhook event verified: ${event.id}`);
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error.stack);
      return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
    }

    try {
      await this.paymentService.handleWebhook(event);
    } catch (error) {
      this.logger.error('Error processing webhook', error.stack);
      return res.status(500).send('Internal Server Error');
    }

    res.status(200).json({ received: true });
  }
}
