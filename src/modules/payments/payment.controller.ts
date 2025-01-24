import { BadRequestException, Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create/instant/user/:userId')
  async createUserInstantSubscription(
    @Param('userId') userId: number,
    @Body('subscriptionType') subscriptionType: 'monthly' | 'yearly',
  ) {
    if (!['monthly', 'yearly'].includes(subscriptionType)) {
      throw new BadRequestException('Invalid subscription type');
    }

    try {
      const paymentLink = await this.paymentService.createSubscriptionPaymentLinkForUser(
        userId,
        subscriptionType,
      );

      return { paymentLink };
    } catch (error) {
      return { error: `Failed to create subscription for user ${userId}: ${error.message}` };
    }
  }

  @Post('create/trial/user/:userId')
  async createUserTrialSubscription(
    @Param('userId') userId: number,
    @Body('subscriptionType') subscriptionType: 'monthly' | 'quarterly' | 'yearly',
  ) {
    if (!['monthly', 'quarterly', 'yearly'].includes(subscriptionType)) {
      throw new BadRequestException('Invalid subscription type');
    }

    try {
      const paymentLink = await this.paymentService.createTrialSubscriptionPaymentLinkForUser(
        userId,
        subscriptionType,
      );

      return { paymentLink };
    } catch (error) {
      return { error: `Failed to create subscription for user ${userId}: ${error.message}` };
    }
  }

  @Post('create/instant/organisation/:organisationId')
  async createOrganisationInstantSubscription(
    @Param('organisationId') organisationId: number,
    @Body('subscriptionType') subscriptionType: 'monthly' | 'yearly',
  ) {
    if (!['monthly', 'yearly'].includes(subscriptionType)) {
      throw new BadRequestException('Invalid subscription type');
    }

    try {
      const paymentLink = await this.paymentService.createSubscriptionPaymentLinkForOrganisation(
        organisationId,
        subscriptionType,
      );

      return { paymentLink };
    } catch (error) {
      return {
        error: `Failed to create subscription for organisation ${organisationId}: ${error.message}`,
      };
    }
  }

  @Post('create/trial/organisation/:organisationId')
  async createOrganisationSubscription(
    @Param('organisationId') organisationId: number,
    @Body('subscriptionType') subscriptionType: 'monthly' | 'quarterly' | 'yearly',
  ) {
    if (!['monthly', 'quarterly', 'yearly'].includes(subscriptionType)) {
      throw new BadRequestException('Invalid subscription type');
    }

    try {
      const paymentLink =
        await this.paymentService.createTrialSubscriptionPaymentLinkForOrganisation(
          organisationId,
          subscriptionType,
        );

      return { paymentLink };
    } catch (error) {
      return {
        error: `Failed to create subscription for user ${organisationId}: ${error.message}`,
      };
    }
  }

  @Post('cancel/user/:userId')
  async cancelSubscriptionForUser(@Param('userId') userId: number) {
    try {
      await this.paymentService.cancelSubscription(userId);

      return { message: `Subscription for user ${userId} has been canceled.` };
    } catch (error) {
      return { error: `Failed to cancel subscription for user ${userId}: ${error.message}` };
    }
  }

  @Post('cancel/organisation/:organisationId')
  async cancelSubscriptionForOrganisation(@Param('organisationId') organisationId: number) {
    try {
      await this.paymentService.cancelSubscriptionForOrganisation(organisationId);

      return { message: `Subscription for organisation ${organisationId} has been canceled.` };
    } catch (error) {
      return {
        error: `Failed to cancel subscription for organisation ${organisationId}: ${error.message}`,
      };
    }
  }

  @Post('activate/user/:userId')
  async activateSubscriptionForUser(
    @Param('userId') userId: string,
    @Body('subscriptionId') subscriptionId: string,
    @Body('email') email: string,
  ) {
    try {
      await this.paymentService.activateCanceledSubscription(subscriptionId, email);

      return { message: `Subscription for user ${userId} has been activated.` };
    } catch (error) {
      return { error: `Failed to activate subscription for user ${userId}: ${error.message}` };
    }
  }

  @Post('activate/organisation/:organisationId')
  async activateSubscriptionForOrganisation(
    @Param('organisationId') organisationId: string,
    @Body('subscriptionId') subscriptionId: string,
    @Body('email') email: string,
  ) {
    try {
      await this.paymentService.activateCanceledSubscription(subscriptionId, email);

      return { message: `Subscription for organisation ${organisationId} has been acxivated.` };
    } catch (error) {
      return {
        error: `Failed to activate subscription for organisation ${organisationId}: ${error.message}`,
      };
    }
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];

    if (!rawBody || !signature) {
      throw new BadRequestException('Missing rawBody or stripe-signature in the request');
    }

    try {
      await this.paymentService.handleWebhook(rawBody, signature as string);
    } catch (error) {
      console.error('Error handling webhook:', error.message);
    }
  }

  @Get('prices')
  async getPrices() {
    try {
      return await this.paymentService.getSubscriptionPrices();
    } catch (error) {
      return { error: `Failed to fetch prices: ${error.message}` };
    }
  }
}
