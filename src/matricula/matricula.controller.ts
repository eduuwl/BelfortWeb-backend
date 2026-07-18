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
}
