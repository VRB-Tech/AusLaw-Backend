import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly endpointSecret: string;
  private readonly stripeSecretKey: string;
  private readonly logger = new Logger(PaymentService.name);

  // constructor(private readonly configService: ConfigService) {
  //   this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
  //   this.endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

  //   if (!this.stripeSecretKey) {
  //     throw new Error('Stripe secret key is not defined in environment variables');
  //   }

  //   this.stripe = new Stripe(this.stripeSecretKey, {
  //     apiVersion: '2024-12-18.acacia',
  //   });
  // }

  // async createPaymentIntent(amount: number, currency: string): Promise<Stripe.PaymentIntent> {
  //   if (!amount || isNaN(amount) || amount <= 0) {
  //     throw new Error('Invalid amount for PaymentIntent');
  //   }

  //   if (!currency || typeof currency !== 'string') {
  //     throw new Error('Invalid currency for PaymentIntent');
  //   }

  //   try {
  //     const paymentIntent = await this.stripe.paymentIntents.create({ amount, currency });
  //     this.logger.log(`PaymentIntent created: ${paymentIntent.id}`);
  //     return paymentIntent;
  //   } catch (error) {
  //     this.logger.error('Error creating PaymentIntent', error.stack);
  //     throw new Error('Failed to create PaymentIntent');
  //   }
  // }

  // public verifyWebhookSignature(
  //   payload: string | Buffer,
  //   signature: string | string[],
  // ): Stripe.Event {
  //   if (!this.endpointSecret) {
  //     throw new Error('Webhook secret is not defined');
  //   }

  //   try {
  //     return this.stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);
  //   } catch (error) {
  //     this.logger.error('Webhook verification failed', error.stack);
  //     throw new Error('Invalid webhook signature');
  //   }
  // }

  // async handleWebhook(event: Stripe.Event): Promise<void> {
  //   this.logger.log(`Processing webhook event: ${event.type}`);

  //   switch (event.type) {
  //     case 'customer.subscription.created':
  //       const createdSubscription = event.data.object as Stripe.Subscription;
  //       this.logger.log(`Subscription created: ID=${createdSubscription.id}`);
  //       break;

  //     case 'invoice.payment_succeeded':
  //       const paymentSucceeded = event.data.object as Stripe.Invoice;
  //       this.logger.log(`Payment succeeded: Invoice ID=${paymentSucceeded.id}`);
  //       break;

  //     case 'invoice.payment_failed':
  //       const paymentFailed = event.data.object as Stripe.Invoice;
  //       this.logger.log(`Payment failed: Invoice ID=${paymentFailed.id}`);
  //       break;

  //     default:
  //       this.logger.warn(`Unhandled event type: ${event.type}`);
  //   }
  // }
}
