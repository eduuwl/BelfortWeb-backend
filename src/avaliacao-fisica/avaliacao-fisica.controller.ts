import {
  Body,
  Controller,
  Get,
  HttpCode,
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
}
