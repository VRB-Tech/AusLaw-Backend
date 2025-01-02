import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { CommunityService } from '../services/communities.service';
import { CreateCommunityDto } from '../dto/create.dto';
import { UpdateCommunityDto } from '../dto/update.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createCommunityDto: CreateCommunityDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    createCommunityDto.image = files.image ? files.image[0] : null;
    createCommunityDto.banner = files.banner ? files.banner[0] : null;

    return this.communityService.create(createCommunityDto);
  }

  @Post(':id/members')
  async addUserToCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.communityService.addUserToCommunity(id, userId);
  }

  @Get()
  findAll() {
    return this.communityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.communityService.findOne(id);
  }

  @Get('user/:userId')
  findAllByUserId(@Param('userId') userId: number) {
    return this.communityService.findAllByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communityService.update(id, updateCommunityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.communityService.remove(id);
  }

  @Delete(':id/members/:userId')
  async removeUserFromCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.communityService.removeUserFromCommunity(id, userId);
  }
}
