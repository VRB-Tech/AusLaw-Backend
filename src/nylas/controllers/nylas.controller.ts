import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/strategies/jwt/jwt-auth.guard';
import { NylasService } from '../nylas.service';

@Controller('nylas')
@UseGuards(JwtAuthGuard)
export class NylasController {
  constructor(private readonly nylasService: NylasService) {}

  @Post('grantId')
  async exchangeToken(@Body('code') code: string) {
    try {
      if (!code) {
        throw new BadRequestException('Authorization code is required');
      }

      const data = await this.nylasService.exchangeCodeForGrantId(code);

      return data;
    } catch (error) {
      throw new Error(`Error exchanging authorization code for token: ${error.message}`);
    }
  }

  @Get('calendars')
  async getCalendars(@Query('grantId') grantId: string) {
    try {
      const response = await this.nylasService.getCalendars(grantId);
      const calendars = response.data;

      if (!calendars || calendars.length === 0) {
        throw new NotFoundException('No calendars found');
      }

      return calendars;
    } catch (error) {
      throw error;
    }
  }

  @Get('calendars/:calendarId')
  async getCalendar(@Param('calendarId') calendarId: string, @Query('grantId') grantId: string) {
    try {
      const calendar = await this.nylasService.getCalendar(calendarId, grantId);
      if (!calendar) {
        throw new NotFoundException('Calendar not found');
      }
      return calendar;
    } catch (error) {
      throw error;
    }
  }

  @Get('calendars/:calendarId/events')
  async getAllEventsFromCalendar(
    @Param('calendarId') calendarId: string,
    @Query('grantId') grantId: string,
  ) {
    try {
      const events = await this.nylasService.getAllEventsFromCalendar(calendarId, grantId);

      return events;
    } catch (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  @Delete('account')
  async deleteAccountFromProjectDashboardByGrantId(@Body('grantId') grantId: string) {
    if (!grantId) {
      throw new HttpException('grantId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.nylasService.deleteUserByGrantId(grantId);

      return result;
    } catch (error) {
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
