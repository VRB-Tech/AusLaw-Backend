import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatGateway } from 'src/gateway/socket.gateway';

interface NylasWebhookEvent {
  type: string;
  object: string;
  data: any;
}

@Controller('nylas/webhook')
export class NylasWebhookController {
  constructor(private readonly chatGateway: ChatGateway) {}

  @Get()
  validateWebhook(
    @Query('challenge') challenge: string,
    @Res() response: Response,
  ) {
    if (challenge) {
      return response.status(HttpStatus.OK).send(challenge);
    }

    return response
      .status(HttpStatus.BAD_REQUEST)
      .send('Missing challenge parameter');
  }

  @Post()
  async handleWebhook(
    @Body() event: NylasWebhookEvent,
    @Res() response: Response,
  ) {
    console.log('Received Nylas event:', event);

    switch (event.type) {
      case 'event.created':
        console.log('Calendar event created:', event.data);
        this.chatGateway.emitToClients('calendarEventCreated', event.data);

        break;

      case 'event.updated':
        console.log('Calendar event updated:', event.data);
        this.chatGateway.emitToClients('calendarEventUpdated', event.data);

        break;

      case 'event.deleted':
        console.log('Calendar event deleted:', event.data);
        this.chatGateway.emitToClients('calendarEventDeleted', event.data);

        break;

      default:
        console.log('Event handled');
    }

    return response.status(HttpStatus.OK).send('Event processed');
  }
}
