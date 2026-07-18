import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AvaliacaoFisicaService } from './avaliacao-fisica.service';
import { CreateAvaliacaoFisicaDto } from './dto/create-avaliacao-fisica.dto';

@Controller('avaliacao-fisica')
export class AvaliacaoFisicaController {
  constructor(
    private readonly avaliacaoFisicaService: AvaliacaoFisicaService,
  ) {}

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateAvaliacaoFisicaDto) {
    await this.avaliacaoFisicaService.forward(dto);
    return { success: true };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.avaliacaoFisicaService.list(page, limit);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.avaliacaoFisicaService.deleteById(id);
    return { success: true };
  }
}
