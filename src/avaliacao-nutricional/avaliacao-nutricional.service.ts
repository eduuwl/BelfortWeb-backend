import { Injectable } from '@nestjs/common';
import {
  AppsScriptRecord,
  AppsScriptService,
} from '../apps-script/apps-script.service';
import { Paginated, paginate } from '../common/paginate';
import { CreateAvaliacaoNutricionalDto } from './dto/create-avaliacao-nutricional.dto';

@Injectable()
export class AvaliacaoNutricionalService {
  constructor(private readonly appsScript: AppsScriptService) {}

  async forward(dto: CreateAvaliacaoNutricionalDto): Promise<void> {
    await this.appsScript.forward('avaliacao-nutricional', { ...dto });
  }

  async list(
    page?: string,
    limit?: string,
  ): Promise<Paginated<AppsScriptRecord>> {
    const records = await this.appsScript.fetchRecords('avaliacao-nutricional');
    return paginate(records, page, limit);
  }

  async updateObservacao(id: string, observacao: string): Promise<void> {
    await this.appsScript.updateFields('avaliacao-nutricional', id, {
      observacao,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.appsScript.deleteRecord('avaliacao-nutricional', id);
  }
}
