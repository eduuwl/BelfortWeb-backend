import { Injectable } from '@nestjs/common';
import {
  AppsScriptRecord,
  AppsScriptService,
} from '../apps-script/apps-script.service';
import { Paginated, paginate } from '../common/paginate';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Injectable()
export class MatriculaService {
  constructor(private readonly appsScript: AppsScriptService) {}

  async forward(dto: CreateMatriculaDto): Promise<void> {
    await this.appsScript.forward('matricula', { ...dto });
  }

  async list(
    page?: string,
    limit?: string,
  ): Promise<Paginated<AppsScriptRecord>> {
    const records = await this.appsScript.fetchRecords('matricula');
    return paginate(records, page, limit);
  }

  async updateObservacao(id: string, observacao: string): Promise<void> {
    await this.appsScript.updateFields('matricula', id, { observacao });
  }

  async updateNumeroMatricula(id: string, numeroMatricula: string): Promise<void> {
    await this.appsScript.updateFields('matricula', id, { numeroMatricula });
  }

  async deleteById(id: string): Promise<void> {
    await this.appsScript.deleteRecord('matricula', id);
  }
}
