import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganisationsModule } from '../organisations/organisations.module';
import { UsersModule } from '../users/users.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, OrganisationsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
