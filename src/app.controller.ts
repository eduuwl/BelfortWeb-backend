import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Usada pelo Render como health check — não pode ser limitada, senão o Render
  // acha que a instância morreu quando o rate limit bloqueia as próprias checagens dele.
  @SkipThrottle()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
