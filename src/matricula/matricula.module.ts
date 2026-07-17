import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { MatriculaController } from './matricula.controller';
import { MatriculaService } from './matricula.service';

@Module({
  imports: [AppsScriptModule],
  controllers: [MatriculaController],
  providers: [MatriculaService],
})
export class MatriculaModule {}
