import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateCortesiaDto } from './dto/create-cortesia.dto';
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
}
