import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { AvaliacaoFisicaController } from './avaliacao-fisica.controller';
import { AvaliacaoFisicaService } from './avaliacao-fisica.service';

@Module({
  imports: [AppsScriptModule],
  controllers: [AvaliacaoFisicaController],
  providers: [AvaliacaoFisicaService],
})
export class AvaliacaoFisicaModule {}
