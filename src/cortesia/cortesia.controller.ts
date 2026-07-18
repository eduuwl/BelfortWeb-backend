import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCortesiaDto } from './dto/create-cortesia.dto';
import { UpdatePresencaDto } from './dto/update-presenca.dto';
import { CortesiaService } from './cortesia.service';

@Controller('cortesia')
export class CortesiaController {
  constructor(private readonly cortesiaService: CortesiaService) {}

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateCortesiaDto) {
    await this.cortesiaService.forward(dto);
    return { success: true };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cortesiaService.list(page, limit);
  }

  @Patch(':id/presenca')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updatePresenca(
    @Param('id') id: string,
    @Body() dto: UpdatePresencaDto,
  ) {
    await this.cortesiaService.updatePresenca(id, dto.confirmada);
    return { success: true };
  }
}
