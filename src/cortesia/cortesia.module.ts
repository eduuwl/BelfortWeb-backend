import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { CortesiaController } from './cortesia.controller';
import { CortesiaService } from './cortesia.service';

@Module({
  imports: [AppsScriptModule],
  controllers: [CortesiaController],
  providers: [CortesiaService],
})
export class CortesiaModule {}
