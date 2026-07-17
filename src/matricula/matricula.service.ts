import { Injectable } from '@nestjs/common';
import { AppsScriptService } from '../apps-script/apps-script.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Injectable()
export class MatriculaService {
  constructor(private readonly appsScript: AppsScriptService) {}

  async forward(dto: CreateMatriculaDto): Promise<void> {
    await this.appsScript.forward('matricula', { ...dto });
  }
}
