import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { parsePtBrTimestampToIso } from '../common/parse-pt-br-timestamp';

export type AppsScriptTipo =
  | 'matricula'
  | 'cortesia'
  | 'avaliacao-fisica'
  | 'avaliacao-nutricional'
  | 'banners';

export type AppsScriptRecord = Record<string, string> & {
  id: string;
  createdAt: string;
};

interface AppsScriptReadResponse {
  success: boolean;
  rows?: Record<string, string>[];
}

interface AppsScriptWriteResponse {
  success: boolean;
  error?: string;
}

@Injectable()
export class AppsScriptService {
  private readonly logger = new Logger(AppsScriptService.name);

  private urlFor(tipo: AppsScriptTipo): string {
    const envVar: Record<AppsScriptTipo, string> = {
      matricula: 'APPS_SCRIPT_URL_MATRICULA',
      cortesia: 'APPS_SCRIPT_URL_CORTESIA',
      'avaliacao-fisica': 'APPS_SCRIPT_URL_AVALIACAO',
      'avaliacao-nutricional': 'APPS_SCRIPT_URL_AVALIACAO_NUTRICIONAL',
      banners: 'APPS_SCRIPT_URL_BANNERS',
    };
    const url = process.env[envVar[tipo]];
    if (!url) {
      throw new InternalServerErrorException(`${envVar[tipo]} não configurada`);
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

  async fetchRecords(tipo: AppsScriptTipo): Promise<AppsScriptRecord[]> {
    const rows = await this.fetchRows(tipo);
    return rows
      .map((row, index): AppsScriptRecord => ({
        ...row,
        id: String(index + 2),
        createdAt: parsePtBrTimestampToIso(row.timestamp ?? ''),
      }))
      .filter((record) => record.timestamp !== '');
  }

  async updateCortesiaPresenca(id: string, confirmada: boolean): Promise<void> {
    await this.postAction(
      'cortesia',
      { acao: 'confirmar-presenca', id, confirmada },
      'Falha ao atualizar a presença na planilha',
      'Registro de cortesia não encontrado',
    );
  }

  async deleteRecord(tipo: AppsScriptTipo, id: string): Promise<void> {
    await this.postAction(
      tipo,
      { acao: 'excluir', tipo, id },
      'Falha ao excluir o registro na planilha',
      'Registro não encontrado',
    );
  }

  async updateFields(
    tipo: AppsScriptTipo,
    id: string,
    campos: Record<string, unknown>,
  ): Promise<void> {
    await this.postAction(
      tipo,
      { acao: 'atualizar-campos', tipo, id, campos },
      'Falha ao atualizar o registro na planilha',
      'Registro não encontrado',
    );
  }

  private async postAction(
    tipo: AppsScriptTipo,
    body: Record<string, unknown>,
    failureMessage: string,
    notFoundMessage: string,
  ): Promise<void> {
    const url = this.urlFor(tipo);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      this.logger.error(
        `Apps Script (${tipo}) respondeu ${response.status} na ação "${String(body.acao)}"`,
      );
      throw new InternalServerErrorException(failureMessage);
    }

    const raw = await response.text();
    let data: AppsScriptWriteResponse;
    try {
      data = JSON.parse(raw) as AppsScriptWriteResponse;
    } catch {
      throw new InternalServerErrorException(
        'A planilha não confirmou a operação. Reimplante o Code.gs (veja o comentário no topo do arquivo).',
      );
    }

    if (!data.success) {
      if (data.error === 'not_found') {
        throw new NotFoundException(notFoundMessage);
      }
      throw new InternalServerErrorException(failureMessage);
    }
  }
}
