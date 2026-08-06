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
import { CreateMatriculaDto } from './dto/create-matricula.dto';
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

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.matriculaService.list(page, limit);
  }

  @Patch(':id/observacao')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateObservacao(
    @Param('id') id: string,
    @Body() dto: UpdateObservacaoDto,
  ) {
    await this.matriculaService.updateObservacao(id, dto.observacao);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.matriculaService.deleteById(id);
    return { success: true };
  }
}
