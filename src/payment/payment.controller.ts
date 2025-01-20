import { Controller, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  // @Post('create')
  // async createPaymentIntent(@Body('amount') amount: number, @Body('currency') currency: string) {
  //   if (!amount || !currency) {
  //     throw new HttpException('Amount and currency are required', HttpStatus.BAD_REQUEST);
  //   }

  //   if (isNaN(amount) || amount <= 0) {
  //     throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
  //   }

  //   if (!['usd', 'eur'].includes(currency.toLowerCase())) {
  //     throw new HttpException('Not allowed currency', HttpStatus.BAD_REQUEST);
  //   }

  //   try {
  //     const paymentIntent = await this.paymentService.createPaymentIntent(amount, currency);
  //     this.logger.log('PaymentIntent created successfully');
  //     return paymentIntent;
  //   } catch (error) {
  //     this.logger.error('Error creating PaymentIntent', error.stack);
  //     throw new HttpException('Failed to create PaymentIntent', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Post('webhook')
  // async handleWebhook(@Req() req: Request, @Res() res: Response) {
  //   const sig = req.headers['stripe-signature'];

  //   let event;

  //   try {
  //     event = this.paymentService.verifyWebhookSignature(req.body, sig);
  //   } catch (error) {
  //     this.logger.error('Webhook signature verification failed', error.stack);
  //     return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  //   }

  //   try {
  //     await this.paymentService.handleWebhook(event);
  //   } catch (error) {
  //     this.logger.error('Error processing webhook', error.stack);
  //     return res.status(500).send('Internal Server Error');
  //   }

  //   res.status(200).json({ received: true });
  // }
}
