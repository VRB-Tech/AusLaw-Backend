import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DataNode } from 'src/types/DataParseNode';
import * as locations from '../../../../fixtures/locations.json';
import * as services from '../../../../fixtures/services.json';

@Controller('filters')
@UseGuards(AuthGuard('jwt'))
export class FiltersController {
  private readonly services: DataNode[];
  private readonly locations: DataNode[];

  constructor() {
    this.services = services;
    this.locations = locations;
  }

  @Get('services')
  async getServices() {
    return this.services;
  }

  @Get('locations')
  async getLocations() {
    return this.locations;
  }
}
