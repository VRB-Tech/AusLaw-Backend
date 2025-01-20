import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private endpointSecret: string;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key is not defined in environment variables');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount for PaymentIntent');
    }
    if (!currency || typeof currency !== 'string') {
      throw new Error('Invalid currency for PaymentIntent');
    }

    try {
      return await this.stripe.paymentIntents.create({ amount, currency });
    } catch (err) {
      console.error('Error creating PaymentIntent:', err.message);
      throw new Error('Failed to create PaymentIntent');
    }
  }

  public verifyWebhookSignature(
    payload: string | Buffer,
    signature: string | string[],
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      throw new Error('Invalid webhook signature');
    }
  }

  async handleWebhook(event: Stripe.Event) {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ID=${createdSubscription.id}`);
        break;

      case 'invoice.payment_succeeded':
        const paymentSucceeded = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded: Invoice ID=${paymentSucceeded.id}`);
        break;

      case 'invoice.payment_failed':
        const paymentFailed = event.data.object as Stripe.Invoice;
        console.log(`Payment failed: Invoice ID=${paymentFailed.id}`);
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
  }
}
