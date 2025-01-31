import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create/instant/user/:userId')
  async createUserInstantSubscription(
    @Param('userId') userId: number,
    @Body('subscriptionType') subscriptionType: 'annualyDoyles',
  ) {
    if (!['annualyDoyles'].includes(subscriptionType)) {
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
    @Body('subscriptionType') subscriptionType: 'monthly' | 'annualy',
  ) {
    if (!['monthly', 'annualy'].includes(subscriptionType)) {
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
    @Body('subscriptionType') subscriptionType: 'annualyDoyles',
  ) {
    if (!['annualyDoyles'].includes(subscriptionType)) {
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
    @Body('subscriptionType') subscriptionType: 'monthly' | 'annualy',
  ) {
    if (!['monthly', 'annualy'].includes(subscriptionType)) {
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
  async cancelSubscriptionForUser(@Param('userId') userId: string) {
    try {
      await this.paymentService.cancelSubscription(userId);

      return { message: `Subscription for user ${userId} has been canceled.` };
    } catch (error) {
      return { error: `Failed to cancel subscription for user ${userId}: ${error.message}` };
    }
  }

  @Post('cancel/organisation/:organisationId')
  async cancelSubscriptionForOrganisation(@Param('organisationId') organisationId: string) {
    try {
      await this.paymentService.cancelSubscriptionForOrganisation(organisationId);

      return { message: `Subscription for organisation ${organisationId} has been canceled.` };
    } catch (error) {
      return {
        error: `Failed to cancel subscription for organisation ${organisationId}: ${error.message}`,
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
