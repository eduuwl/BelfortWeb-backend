import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppsScriptService } from '../apps-script/apps-script.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly appsScript: AppsScriptService) {}

  private getTransporter(): Transporter | null {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) return null;

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
    return this.transporter;
  }

  @Cron('0 18 * * *', { timeZone: 'America/Belem' })
  async enviarLembretes(): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(
        'GMAIL_USER/GMAIL_APP_PASSWORD não configurados — lembrete de aula não enviado.',
      );
      return;
    }

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toLocaleDateString('pt-BR', {
      timeZone: 'America/Belem',
    });

    let rows: Record<string, string>[];
    try {
      rows = await this.appsScript.fetchRows('cortesia');
    } catch (err) {
      this.logger.error(
        'Falha ao buscar agendamentos de cortesia para o lembrete',
        err as Error,
      );
      return;
    }

    const pendentes = rows.filter((row) =>
      String(row.datasAula ?? '')
        .split(',')
        .map((d) => d.trim())
        .includes(amanhaStr),
    );

    for (const row of pendentes) {
      if (!row.email) continue;
      try {
        await transporter.sendMail({
          from: `Academia Belfort <${process.env.GMAIL_USER}>`,
          to: row.email,
          subject: 'Sua aula de cortesia é amanhã! 💪',
          html: this.montarEmail(row),
        });
        this.logger.log(`Lembrete enviado para ${row.email}`);
      } catch (err) {
        this.logger.error(
          `Falha ao enviar lembrete para ${row.email}`,
          err as Error,
        );
      }
    }
  }

  private montarEmail(row: Record<string, string>): string {
    const primeiroNome = (row.nome ?? '').trim().split(' ')[0] || 'tudo bem';
    return `
      <div style="font-family: sans-serif; font-size: 15px; color: #111;">
        <p>Olá, ${primeiroNome}!</p>
        <p>Passando pra lembrar que sua aula de cortesia (<strong>${row.modalidade}</strong>) na Academia Belfort
        é <strong>amanhã</strong>, às <strong>${row.horario}</strong>.</p>
        <p>Chegue com uns 10 minutos de antecedência. Qualquer dúvida, é só chamar no WhatsApp.</p>
        <p>Até lá! 🏋️</p>
      </div>
    `;
  }
}
