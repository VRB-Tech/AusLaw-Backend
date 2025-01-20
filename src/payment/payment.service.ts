import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private static stripeInstance: Stripe | null = null;
  private readonly logger = new Logger(PaymentService.name);

  private readonly stripeSecretKey: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripeSecretKey) {
      this.logger.error('Stripe secret key is not defined in environment variables');
      throw new Error('Stripe secret key is not defined in environment variables');
    }

    if (!this.webhookSecret) {
      this.logger.warn('Stripe webhook secret is not defined in environment variables');
    }

    if (!PaymentService.stripeInstance) {
      this.logger.log('Initializing Stripe instance...');
      PaymentService.stripeInstance = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    }
  }

  private get stripe(): Stripe {
    if (!PaymentService.stripeInstance) {
      throw new Error('Stripe instance is not initialized');
    }

    return PaymentService.stripeInstance;
  }

  async createPaymentIntent(amount: number, currency: string): Promise<Stripe.PaymentIntent> {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount for PaymentIntent');
    }

    if (!currency || typeof currency !== 'string') {
      throw new Error('Invalid currency for PaymentIntent');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({ amount, currency });
      this.logger.log(`PaymentIntent created: ID=${paymentIntent.id}`);

      return paymentIntent;
    } catch (err) {
      this.logger.error('Error creating PaymentIntent', err.stack);
      throw new Error('Failed to create PaymentIntent');
    }
  }

  async createCustomer(email: string, paymentMethodId: string): Promise<Stripe.Customer> {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email for customer creation');
    }

    if (!paymentMethodId) {
      throw new Error('Payment method ID is required to create a customer');
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      this.logger.log(`Customer created: ID=${customer.id}`);
      return customer;
    } catch (err) {
      this.logger.error('Error creating Stripe customer', err.stack);
      throw new Error('Failed to create customer');
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    trialPeriodDays = 14,
  ): Promise<{ id: string; status: string }> {
    if (!customerId) {
      throw new Error('Customer ID is required for subscription creation');
    }

    if (!priceId) {
      throw new Error('Price ID is required for subscription creation');
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialPeriodDays,
      });

      this.logger.log(`Subscription created: ID=${subscription.id}`);
      return { id: subscription.id, status: subscription.status };
    } catch (err) {
      this.logger.error('Error creating subscription', err.stack);
      throw new Error('Failed to create subscription');
    }
  }

  public verifyWebhookSignature(
    payload: string | Buffer,
    signature: string | string[],
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error('Webhook verification failed:', err.stack);
      throw new Error('Invalid webhook signature');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        this.logger.log(`Subscription created: ID=${createdSubscription.id}`);
        break;

      case 'invoice.payment_succeeded':
        const paymentSucceeded = event.data.object as Stripe.Invoice;
        this.logger.log(`Payment succeeded: Invoice ID=${paymentSucceeded.id}`);
        break;

      case 'invoice.payment_failed':
        const paymentFailed = event.data.object as Stripe.Invoice;
        this.logger.log(`Payment failed: Invoice ID=${paymentFailed.id}`);
        break;

      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }
  }
}
