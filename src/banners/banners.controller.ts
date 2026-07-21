import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // Pública, sem custo de escrita, chamada em todo carregamento da home (às vezes duas
  // vezes por visita) — não pode levar o rate limit padrão de 5/min, senão vira 429 real
  // pra visitantes normais do site.
  @SkipThrottle()
  @Get()
  async list() {
    return this.bannersService.listPublic();
  }
}
