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
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateObservacaoDto } from '../common/dto/update-observacao.dto';
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

  // Rotas administrativas (atrás de JwtAuthGuard) ficam fora do rate limit padrão de 5/min —
  // esse limite existe pra proteger os endpoints públicos de abuso, mas o painel logado pagina,
  // filtra por unidade e edita registro por registro, gerando bem mais de 5 requisições por
  // minuto num uso normal. Um JWT válido já é a proteção real aqui.
  @Get()
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unidade') unidade?: string,
  ) {
    return this.avaliacaoFisicaService.list(page, limit, unidade);
  }

  @Patch(':id/observacao')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @HttpCode(200)
  async updateObservacao(
    @Param('id') id: string,
    @Body() dto: UpdateObservacaoDto,
  ) {
    await this.avaliacaoFisicaService.updateObservacao(id, dto.observacao);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.avaliacaoFisicaService.deleteById(id);
    return { success: true };
  }
}
