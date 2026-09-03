import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateObservacaoDto } from '../common/dto/update-observacao.dto';
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
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unidade') unidade?: string,
  ) {
    return this.cortesiaService.list(page, limit, unidade);
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

  @Patch(':id/observacao')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateObservacao(
    @Param('id') id: string,
    @Body() dto: UpdateObservacaoDto,
  ) {
    await this.cortesiaService.updateObservacao(id, dto.observacao);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.cortesiaService.deleteById(id);
    return { success: true };
  }
}
