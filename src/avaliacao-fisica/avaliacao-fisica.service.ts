import { Injectable } from '@nestjs/common';
import {
  AppsScriptRecord,
  AppsScriptService,
} from '../apps-script/apps-script.service';
import { Paginated, paginate } from '../common/paginate';
import { CreateAvaliacaoFisicaDto } from './dto/create-avaliacao-fisica.dto';

@Injectable()
export class AvaliacaoFisicaService {
  constructor(private readonly appsScript: AppsScriptService) {}

  async forward(dto: CreateAvaliacaoFisicaDto): Promise<void> {
    await this.appsScript.forward('avaliacao-fisica', { ...dto });
  }

  async list(
    page?: string,
    limit?: string,
  ): Promise<Paginated<AppsScriptRecord>> {
    const records = await this.appsScript.fetchRecords('avaliacao-fisica');
    return paginate(records, page, limit);
  }
}
