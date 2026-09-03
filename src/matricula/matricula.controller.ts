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
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateNumeroMatriculaDto } from './dto/update-numero-matricula.dto';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateMatriculaDto) {
    await this.matriculaService.forward(dto);
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
    return this.matriculaService.list(page, limit, unidade);
  }

  @Patch(':id/observacao')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @HttpCode(200)
  async updateObservacao(
    @Param('id') id: string,
    @Body() dto: UpdateObservacaoDto,
  ) {
    await this.matriculaService.updateObservacao(id, dto.observacao);
    return { success: true };
  }

  @Patch(':id/numero-matricula')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @HttpCode(200)
  async updateNumeroMatricula(
    @Param('id') id: string,
    @Body() dto: UpdateNumeroMatriculaDto,
  ) {
    await this.matriculaService.updateNumeroMatricula(id, dto.numeroMatricula);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.matriculaService.deleteById(id);
    return { success: true };
  }
}
