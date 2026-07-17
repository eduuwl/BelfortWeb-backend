import { Body, Controller, HttpCode, Post } from '@nestjs/common';
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
}
