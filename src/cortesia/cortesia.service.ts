import { ConflictException, Injectable } from '@nestjs/common';
import { AppsScriptService } from '../apps-script/apps-script.service';
import { onlyDigits } from '../common/only-digits';
import { CreateCortesiaDto } from './dto/create-cortesia.dto';

@Injectable()
export class CortesiaService {
  constructor(private readonly appsScript: AppsScriptService) {}

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
