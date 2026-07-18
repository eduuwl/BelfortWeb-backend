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
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.avaliacaoNutricionalService.list(page, limit);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    await this.avaliacaoNutricionalService.deleteById(id);
    return { success: true };
  }
}
