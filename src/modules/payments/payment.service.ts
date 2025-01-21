import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
      });
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error creating payment intent', error);
      throw error;
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Error retrieving payment intent', error);
      throw error;
    }
  }

  async handleWebhook(eventPayload: Buffer, stripeSignature: string) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        eventPayload,
        stripeSignature,
        endpointSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          this.logger.log(`PaymentIntent was successful: ${event.id}`);
          break;

        case 'payment_intent.payment_failed':
          this.logger.warn(`PaymentIntent failed: ${event.id}`);
          break;

        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw error;
    }
  }
}
