import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatriculaModule } from './matricula/matricula.module';
import { CortesiaModule } from './cortesia/cortesia.module';
import { AvaliacaoFisicaModule } from './avaliacao-fisica/avaliacao-fisica.module';
import { ReminderModule } from './reminder/reminder.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    ScheduleModule.forRoot(),
    AuthModule,
    MatriculaModule,
    CortesiaModule,
    AvaliacaoFisicaModule,
    ReminderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
