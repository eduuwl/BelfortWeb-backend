import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { ReminderService } from './reminder.service';

@Module({
  imports: [AppsScriptModule],
  providers: [ReminderService],
})
export class ReminderModule {}
