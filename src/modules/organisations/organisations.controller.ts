import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { CreateOrganisationDto } from './dto/create.dto';
import { UpdateOrganisationDto } from './dto/update.dto';
import { Organisation } from './entities/Organisation';
import { OrganisationsService } from './organisations.service';

@Controller('organisations')
@UseGuards(JwtAuthGuard)
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

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(@Param('email') email: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findByEmail(email);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return organisation;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findById(id);

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    return organisation;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('photo', 1))
  async update(
    @Param('id') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
    @UploadedFiles() photo: Express.Multer.File[],
  ): Promise<Organisation> {
    if (photo && photo.length > 0) {
      updateOrganisationDto.photo = photo[0];
    }

    const updatedOrganisation = await this.organisationsService.update(id, updateOrganisationDto);

    return updatedOrganisation;
  }
}
