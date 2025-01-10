import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    sgMail.setApiKey(sendGridApiKey);
  }

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const msg = {
      to,
      from: 'bohdan.lesyk@vrbtech.org',
      subject,
      html,
    };

    await sgMail.send(msg);
  }
}
