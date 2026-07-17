import { Module } from '@nestjs/common';
import { AppsScriptService } from './apps-script.service';

@Module({
  providers: [AppsScriptService],
  exports: [AppsScriptService],
})
export class AppsScriptModule {}
