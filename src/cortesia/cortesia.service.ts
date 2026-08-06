import { ConflictException, Injectable } from '@nestjs/common';
import { AppsScriptService } from '../apps-script/apps-script.service';
import { onlyDigits } from '../common/only-digits';
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
  ): Promise<Paginated<CortesiaRecord>> {
    const records = await this.appsScript.fetchRecords('cortesia');
    const withPresenca: CortesiaRecord[] = records.map((record) => ({
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
