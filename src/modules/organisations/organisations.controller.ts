import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create.dto';
import { UpdateOrganisationDto } from './dto/update.dto';
import { Organisation } from './entities/Organisation';
import { OrganisationsService } from './organisations.service';

@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrganisationDto: CreateOrganisationDto): Promise<Organisation> {
    try {
      const organisation = await this.organisationsService.create(createOrganisationDto);

      return organisation;
    } catch (error) {
      throw error;
    }
  }

  @Get(':email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(@Param('email') email: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findByEmail(email);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    return organisation;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findById(id);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    return organisation;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
  ): Promise<Organisation> {
    const organisation = await this.organisationsService.findById(id);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    const updatedOrganisation = await this.organisationsService.update(id, updateOrganisationDto);
    return updatedOrganisation;
  }

  @Put(':id/payment-status')
  @HttpCode(HttpStatus.OK)
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: string },
  ): Promise<void> {
    const organisation = await this.organisationsService.findById(id);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    await this.organisationsService.updatePaymentStatus(id, body.paymentStatus);
  }

  @Put(':id/refresh-token')
  @HttpCode(HttpStatus.OK)
  async updateRefreshToken(
    @Param('id') id: string,
    @Body() body: { refreshToken: string },
  ): Promise<void> {
    const organisation = await this.organisationsService.findById(id);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    await this.organisationsService.updateRefreshToken(id, body.refreshToken);
  }

  @Put(':id/password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Param('id') id: string, @Body() body: { password: string }): Promise<void> {
    const organisation = await this.organisationsService.findById(id);
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    await this.organisationsService.updatePassword(id, body.password);
  }
}
