import { ConflictException, Injectable } from '@nestjs/common';
import { AppsScriptService } from '../apps-script/apps-script.service';
import { filterByUnidade } from '../common/filter-by-unidade';
import { onlyDigits } from '../common/only-digits';
import { parsePtBrDate } from '../common/parse-pt-br-date';
import { Paginated, paginate } from '../common/paginate';
import { CreateCortesiaDto } from './dto/create-cortesia.dto';

export interface CortesiaRecord {
  timestamp: string;
  nome: string;
  whatsapp: string;
  email: string;
  cpf: string;
  modalidade: string;
  unidade: string;
  horario: string;
  dia: string;
  datasAula: string;
  limitacao: string;
  id: string;
  createdAt: string;
  presencaConfirmada: boolean;
  observacao: string;
}

@Injectable()
export class CortesiaService {
  constructor(private readonly appsScript: AppsScriptService) {}

  async list(
    page?: string,
    limit?: string,
    unidade?: string,
  ): Promise<Paginated<CortesiaRecord>> {
    const records = await this.appsScript.fetchRecords('cortesia');
    const withPresenca: CortesiaRecord[] = filterByUnidade(
      records,
      unidade,
      (r) => r.unidade ?? '',
    ).map((record) => ({
      timestamp: record.timestamp ?? '',
      nome: record.nome ?? '',
      whatsapp: record.whatsapp ?? '',
      email: record.email ?? '',
      cpf: record.cpf ?? '',
      modalidade: record.modalidade ?? '',
      unidade: record.unidade ?? '',
      horario: record.horario ?? '',
      dia: record.dia ?? '',
      datasAula: record.datasAula ?? '',
      limitacao: record.limitacao ?? '',
      id: record.id,
      createdAt: record.createdAt,
      presencaConfirmada: record.presencaConfirmada === 'true',
      observacao: record.observacao ?? '',
    }));

    // Organiza por data da aula (a mais próxima primeiro), não pela ordem de inscrição na
    // planilha — com muita cortesia por dia, a recepção precisa ver a agenda em ordem
    // cronológica. Registros sem data válida (não deveria acontecer, mas por segurança) vão
    // pro final, sem quebrar a ordenação dos demais.
    withPresenca.sort((a, b) => {
      const dateA = parsePtBrDate(a.datasAula);
      const dateB = parsePtBrDate(b.datasAula);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });

    return paginate(withPresenca, page, limit);
  }

  async updatePresenca(id: string, confirmada: boolean): Promise<void> {
    await this.appsScript.updateCortesiaPresenca(id, confirmada);
  }

  async updateObservacao(id: string, observacao: string): Promise<void> {
    await this.appsScript.updateFields('cortesia', id, { observacao });
  }

  async deleteById(id: string): Promise<void> {
    await this.appsScript.deleteRecord('cortesia', id);
  }

  async forward(dto: CreateCortesiaDto): Promise<void> {
    const rows = await this.appsScript.fetchRows('cortesia');
    const cpf = onlyDigits(dto.cpf);
    const jaUsou = rows.some(
      (row) => onlyDigits(String(row.cpf ?? '')) === cpf,
    );

    if (jaUsou) {
      throw new ConflictException(
        'Esse CPF já utilizou a aula de cortesia gratuita. Fale com a nossa recepção pelo WhatsApp para conhecer os planos.',
      );
    }

    await this.appsScript.forward('cortesia', { ...dto });
  }
}
