import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileUploader } from 'src/middlewares/FileUploader';
import { CloudinaryConfig } from 'src/uploads/cloudinary.config';
import { Organisation } from './entities/Organisation';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';

@Module({
  imports: [SequelizeModule.forFeature([Organisation])],
  providers: [OrganisationsService, FileUploader, CloudinaryConfig],
  controllers: [OrganisationsController],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
