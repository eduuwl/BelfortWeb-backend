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
import { AvaliacaoNutricionalService } from './avaliacao-nutricional.service';
import { CreateAvaliacaoNutricionalDto } from './dto/create-avaliacao-nutricional.dto';

@Controller('avaliacao-nutricional')
export class AvaliacaoNutricionalController {
  constructor(
    private readonly avaliacaoNutricionalService: AvaliacaoNutricionalService,
  ) {}

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateAvaliacaoNutricionalDto) {
    await this.avaliacaoNutricionalService.forward(dto);
    return { success: true };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unidade') unidade?: string,
  ) {
    return this.avaliacaoNutricionalService.list(page, limit, unidade);
  }

  @Patch(':id/observacao')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateObservacao(
    @Param('id') id: string,
    @Body() dto: UpdateObservacaoDto,
  ) {
    await this.avaliacaoNutricionalService.updateObservacao(id, dto.observacao);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.avaliacaoNutricionalService.deleteById(id);
    return { success: true };
  }
}
