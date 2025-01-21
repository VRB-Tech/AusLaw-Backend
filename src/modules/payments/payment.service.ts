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

  async createTrialSubscriptionPaymentLink(
    subscriptionType: 'monthly' | 'quarterly' | 'yearly',
  ): Promise<string> {
    try {
      const priceId = this.getPriceIdBySubscriptionType(subscriptionType);

      if (!priceId) {
        throw new Error(`Price ID for subscription type ${subscriptionType} is not configured`);
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: 14,
        },
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/success`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/cancel`,
      });

      return session.url;
    } catch (error) {
      this.logger.error(
        `Error creating trial subscription payment link for ${subscriptionType}`,
        error,
      );
      throw error;
    }
  }

  private getPriceIdBySubscriptionType(subscriptionType: string): string {
    const priceMap = {
      monthly: this.configService.get<string>('STRIPE_MONTHLY_PRICE_ID'),
      quarterly: this.configService.get<string>('STRIPE_QUARTERLY_PRICE_ID'),
      yearly: this.configService.get<string>('STRIPE_YEARLY_PRICE_ID'),
    };
    return priceMap[subscriptionType];
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
