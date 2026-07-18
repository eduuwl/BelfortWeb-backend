import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { AvaliacaoNutricionalController } from './avaliacao-nutricional.controller';
import { AvaliacaoNutricionalService } from './avaliacao-nutricional.service';

@Module({
  imports: [AppsScriptModule],
  controllers: [AvaliacaoNutricionalController],
  providers: [AvaliacaoNutricionalService],
})
export class AvaliacaoNutricionalModule {}
