import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { addMonths, startOfDay } from 'date-fns';
import Nylas from 'nylas';

@Injectable()
export class NylasService {
  private nylas: Nylas;
  private apiUrl: string;
  private clientId: string;
  private apiKey: string;
  private redirectUri: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('NYLAS_CLIENT_ID');
    this.apiKey = this.configService.get<string>('NYLAS_API_KEY');
    this.apiUrl = this.configService.get<string>('NYLAS_API_URI');
    this.redirectUri = this.configService.get<string>('NYLAS_REDIRECT_URI');

    this.nylas = new Nylas({
      apiKey: this.apiKey,
      apiUri: this.apiUrl,
    });
  }

  async exchangeCodeForGrantId(code: string): Promise<string> {
    const body = {
      client_id: this.clientId,
      client_secret: this.apiKey,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    };

    try {
      const response = await axios.post(`${this.apiUrl}/v3/connect/token`, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  async getCalendar(calendarId: string, grantId: string) {
    try {
      const calendar = await this.nylas.calendars.find({
        identifier: grantId,
        calendarId,
      });

      return calendar;
    } catch (error) {
      console.error('Error fetching calendar:', error.message);
      throw error;
    }
  }

  async getCalendars(grantId: string) {
    try {
      const calendars = await this.nylas.calendars.list({
        identifier: grantId,
      });

      return calendars;
    } catch (error) {
      console.error('Error fetching calendars:', error.message);
      throw error;
    }
  }

  async getAllEventsFromCalendar(calendarId: string, grantId: string) {
    try {
      const now = startOfDay(new Date());
      const threeMonthsLater = addMonths(now, 12);

      const events = await this.nylas.events.list({
        identifier: grantId,
        queryParams: {
          calendarId: calendarId,
          start: now.toISOString(),
          end: threeMonthsLater.toISOString(),
          limit: 200,
        },
      });

      return events;
    } catch (error) {
      console.error('Error fetching events from calendar:', error.message);
      throw error;
    }
  }

  async deleteUserByGrantId(grantId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/v3/grants/${grantId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    } catch (error) {
      console.error('Error deleting account:', error.response?.data || error.message);
      throw new Error(
        `Failed to delete account: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
