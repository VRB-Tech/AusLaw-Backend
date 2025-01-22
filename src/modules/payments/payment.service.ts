import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

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
    userId: string,
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

      await this.userService.update(userId, {
        subscriptionId: session.subscription as string,
        paymentStatus: 'active',
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

  async cancelSubscription(userId: number): Promise<void> {
    try {
      const user = await this.userService.findById(userId);

      if (!user || !user.subscriptionId) {
        throw new Error('User or subscription not found');
      }

      await this.stripe.subscriptions.cancel(user.subscriptionId);
      await this.userService.update(user.id.toString(), { paymentStatus: 'canceled' });

      this.logger.log(`Subscription canceled for user ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Error canceling subscription for user ID: ${userId}`, error);
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
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userSuccess = await this.userService.findBySubscriptionId(
            paymentIntent.id as string,
          );

          if (userSuccess) {
            await this.userService.update(userSuccess.id.toString(), { paymentStatus: 'active' });
            this.logger.log(
              `PaymentIntent succeeded. Updated status to active for user ID: ${userSuccess.id}`,
            );
          }

          break;

        case 'payment_intent.payment_failed':
          const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
          const userFailed = await this.userService.findBySubscriptionId(
            paymentIntentFailed.id as string,
          );

          if (userFailed) {
            await this.userService.update(userFailed.id.toString(), { paymentStatus: 'failed' });
            this.logger.warn(
              `PaymentIntent failed. Updated status to failed for user ID: ${userFailed.id}`,
            );
          }

          break;

        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const userCanceled = await this.userService.findBySubscriptionId(subscription.id);

          if (userCanceled) {
            await this.userService.update(userCanceled.id.toString(), {
              paymentStatus: 'canceled',
            });
            this.logger.log(`Subscription canceled for user ID: ${userCanceled.id}`);
          }

          break;

        default:
          this.logger.debug(`New event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw error;
    }
  }
}
