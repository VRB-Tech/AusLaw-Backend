import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly stripeSecretKey: string;
  private readonly endpointSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key is not defined in environment variables');
    }

    this.stripe = new Stripe(this.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // async createPaymentIntent(amount: number, currency: string) {
  //   if (!amount || isNaN(amount) || amount <= 0) {
  //     throw new Error('Invalid amount for PaymentIntent');
  //   }

  //   if (!currency || typeof currency !== 'string') {
  //     throw new Error('Invalid currency for PaymentIntent');
  //   }

  //   try {
  //     return await this.stripe.paymentIntents.create({ amount, currency });
  //   } catch (err) {
  //     console.error('Error creating PaymentIntent:', err.message);
  //     throw new Error('Failed to create PaymentIntent');
  //   }
  // }

  // async createCustomer(email: string, paymentMethodId: string) {
  //   if (!email || !email.includes('@')) {
  //     throw new Error('Invalid email for customer creation');
  //   }

  //   if (!paymentMethodId) {
  //     throw new Error('Payment method ID is required to create a customer');
  //   }

  //   try {
  //     return await this.stripe.customers.create({
  //       email,
  //       payment_method: paymentMethodId,
  //       invoice_settings: { default_payment_method: paymentMethodId },
  //     });
  //   } catch (err) {
  //     console.error('Error creating Stripe customer:', err.message);
  //     throw new Error('Failed to create customer');
  //   }
  // }

  // async createSubscription(customerId: string, priceId: string, trialPeriodDays = 14) {
  //   if (!customerId) {
  //     throw new Error('Customer ID is required for subscription creation');
  //   }

  //   if (!priceId) {
  //     throw new Error('Price ID is required for subscription creation');
  //   }

  //   try {
  //     const subscription = await this.stripe.subscriptions.create({
  //       customer: customerId,
  //       items: [{ price: priceId }],
  //       trial_period_days: trialPeriodDays,
  //     });

  //     return { id: subscription.id, status: subscription.status };
  //   } catch (err) {
  //     console.error('Error creating subscription:', err.message);
  //     throw new Error('Failed to create subscription');
  //   }
  // }

  // public verifyWebhookSignature(
  //   payload: string | Buffer,
  //   signature: string | string[],
  // ): Stripe.Event {
  //   try {
  //     return this.stripe.webhooks.constructEvent(payload, signature, this.endpointSecret);
  //   } catch (err) {
  //     console.error('Webhook verification failed:', err.message);
  //     throw new Error('Invalid webhook signature');
  //   }
  // }

  // async handleWebhook(event: Stripe.Event) {
  //   console.log(`Processing webhook event: ${event.type}`);

  //   switch (event.type) {
  //     case 'customer.subscription.created':
  //       const createdSubscription = event.data.object as Stripe.Subscription;
  //       console.log(`Subscription created: ID=${createdSubscription.id}`);
  //       break;

  //     case 'invoice.payment_succeeded':
  //       const paymentSucceeded = event.data.object as Stripe.Invoice;
  //       console.log(`Payment succeeded: Invoice ID=${paymentSucceeded.id}`);
  //       break;

  //     case 'invoice.payment_failed':
  //       const paymentFailed = event.data.object as Stripe.Invoice;
  //       console.log(`Payment failed: Invoice ID=${paymentFailed.id}`);
  //       break;

  //     default:
  //       console.warn(`Unhandled event type: ${event.type}`);
  //   }
  // }
}
