import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@Controller('admin/banners')
@UseGuards(JwtAuthGuard)
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.bannersService.listAdmin(page, limit);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagem', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  async create(
    @UploadedFile() imagem: Express.Multer.File,
    @Body() dto: CreateBannerDto,
  ) {
    if (!imagem) {
      throw new BadRequestException('Campo "imagem" é obrigatório');
    }
    await this.bannersService.create(imagem, dto);
    return { success: true };
  }

  @Patch(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    await this.bannersService.updateMetadata(id, dto);
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.bannersService.deleteById(id);
    return { success: true };
  }
}
