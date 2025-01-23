import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrganisationsService } from '../organisations/organisations.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly organisationService: OrganisationsService,
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

  async createSubscriptionPaymentLinkForUser(
    userId: number,
    subscriptionType: 'monthly' | 'yearly',
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
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/success`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/cancel`,
      });

      await this.userService.update(userId.toString(), {
        checkoutSessionId: session.id,
        paymentStatus: 'pending',
      });

      return session.url;
    } catch (error) {
      this.logger.error(`Error creating subscription payment link for ${subscriptionType}`, error);
      throw error;
    }
  }

  async createSubscriptionPaymentLinkForOrganisation(
    organisationId: number,
    subscriptionType: 'monthly' | 'yearly',
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
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/success`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/cancel`,
      });

      await this.organisationService.update(organisationId.toString(), {
        checkoutSessionId: session.id,
        paymentStatus: 'pending',
      });

      return session.url;
    } catch (error) {
      this.logger.error(`Error creating subscription payment link for ${subscriptionType}`, error);
      throw error;
    }
  }

  async createTrialSubscriptionPaymentLinkForUser(
    userId: number,
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

      await this.userService.update(userId.toString(), {
        checkoutSessionId: session.id,
        paymentStatus: 'pending',
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

  async createTrialSubscriptionPaymentLinkForOrganisation(
    organisationId: number,
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

      await this.organisationService.update(organisationId.toString(), {
        checkoutSessionId: session.id,
        paymentStatus: 'pending',
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

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.subscriptionId) {
        throw new Error('User does not have an active subscription');
      }

      await this.stripe.subscriptions.cancel(user.subscriptionId);
      await this.userService.update(user.id.toString(), { paymentStatus: 'canceled' });

      this.logger.log(`Subscription canceled for user ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Error canceling subscription for user ID: ${userId}`, error);
      throw error;
    }
  }

  async cancelSubscriptionForOrganisation(organisationId: number): Promise<void> {
    try {
      const organisation = await this.organisationService.findById(organisationId);

      if (!organisation) {
        throw new Error('User not found');
      }

      if (!organisation.subscriptionId) {
        throw new Error('User does not have an active subscription');
      }

      await this.stripe.subscriptions.cancel(organisation.subscriptionId);
      await this.organisationService.update(organisation.id.toString(), {
        paymentStatus: 'canceled',
      });

      this.logger.log(`Subscription canceled for user ID: ${organisationId}`);
    } catch (error) {
      this.logger.error(`Error canceling subscription for user ID: ${organisationId}`, error);
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
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const user = await this.userService.findByCheckoutSessionId(session.id as string);

          if (user) {
            await this.userService.update(user.id.toString(), {
              paymentStatus: 'active',
              customerStripeId: session.customer as string,
              subscriptionId: session.subscription as string,
            });
            this.logger.log(`Payment completed for user ID: ${user.id}`);
          } else {
            this.logger.warn(`No user found for checkout session ID: ${session.id}`);
          }

          break;

        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          const user = await this.userService.findByStripeCustomerId(
            subscription.customer as string,
          );

          if (user) {
            await this.userService.update(user.id.toString(), { subscriptionId: subscription.id });
            this.logger.log(
              `Subscription canceled. Updated status to canceled for user ID: ${user.id}`,
            );
          } else {
            this.logger.warn(`No user found for subscription ID: ${subscription.id}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const user = await this.userService.findBySubscriptionId(subscription.id);

          if (user) {
            await this.userService.update(user.id.toString(), {
              paymentStatus: 'canceled',
              subscriptionId: null,
            });
            this.logger.log(
              `Subscription canceled. Updated status to canceled for user ID: ${user.id}`,
            );
          } else {
            this.logger.warn(`No user found for subscription ID: ${subscription.id}`);
          }
          break;
        }

        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error handling webhook event: ${error.message}`, error);
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }
}
