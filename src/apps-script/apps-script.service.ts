import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export type AppsScriptTipo = 'matricula' | 'cortesia';

interface AppsScriptReadResponse {
  success: boolean;
  rows?: Record<string, string>[];
}

@Injectable()
export class AppsScriptService {
  private readonly logger = new Logger(AppsScriptService.name);

  private urlFor(tipo: AppsScriptTipo): string {
    const envVar =
      tipo === 'matricula'
        ? 'APPS_SCRIPT_URL_MATRICULA'
        : 'APPS_SCRIPT_URL_CORTESIA';
    const url = process.env[envVar];
    if (!url) {
      throw new InternalServerErrorException(`${envVar} não configurada`);
    }
    return url;
  }

  async forward(
    tipo: AppsScriptTipo,
    dto: Record<string, unknown>,
  ): Promise<void> {
    const url = this.urlFor(tipo);
    const payload = {
      tipo,
      ...dto,
      timestamp: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Belem',
      }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(
        `Apps Script (${tipo}) respondeu ${response.status} ao gravar`,
      );
      throw new InternalServerErrorException(
        'Falha ao enviar os dados para a planilha',
      );
    }
  }

  async fetchRows(tipo: AppsScriptTipo): Promise<Record<string, string>[]> {
    const url = this.urlFor(tipo);
    const secret = process.env.APPS_SCRIPT_SHARED_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        'APPS_SCRIPT_SHARED_SECRET não configurada',
      );
    }

    const response = await fetch(
      `${url}?tipo=${tipo}&secret=${encodeURIComponent(secret)}`,
    );
    if (!response.ok) {
      this.logger.error(
        `Apps Script (${tipo}) respondeu ${response.status} ao ler`,
      );
      throw new InternalServerErrorException('Falha ao consultar a planilha');
    }

    const raw = await response.text();
    let data: AppsScriptReadResponse;
    try {
      data = JSON.parse(raw) as AppsScriptReadResponse;
    } catch {
      this.logger.error(
        'Apps Script não devolveu JSON ao ler — provavelmente o Code.gs precisa ser reimplantado com o doGet novo',
      );
      throw new InternalServerErrorException(
        'A planilha ainda não está pronta pra consulta. Reimplante o Code.gs (veja o comentário no topo do arquivo).',
      );
    }

    if (!data.success) {
      throw new InternalServerErrorException('Falha ao consultar a planilha');
    }
    return data.rows ?? [];
  }
}
