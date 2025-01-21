import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent } from 'https';
import { Stripe } from 'stripe';

@Global()
@Module({
  providers: [
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');

        if (!stripeSecretKey) {
          throw new Error('Stripe secret key is not defined in environment variables');
        }

        return new Stripe(stripeSecretKey, {
          apiVersion: '2024-12-18.acacia',
          httpAgent: new Agent({
            keepAlive: true,
            maxSockets: 10,
          }),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [Stripe],
})
export class StripeModule {}
