import { Injectable } from '@nestjs/common';
import { AppsScriptService } from '../apps-script/apps-script.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Paginated, paginate } from '../common/paginate';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

export interface BannerRecord {
  id: string;
  createdAt: string;
  imageUrl: string;
  ordem: number;
  ativo: boolean;
  link: string | null;
  alt: string;
}

@Injectable()
export class BannersService {
  constructor(
    private readonly appsScript: AppsScriptService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(file: Express.Multer.File, dto: CreateBannerDto): Promise<void> {
    const { url, publicId } = await this.cloudinary.uploadImage(file.buffer);
    await this.appsScript.forward('banners', {
      imageUrl: url,
      cloudinaryPublicId: publicId,
      ordem: dto.ordem,
      ativo: dto.ativo,
      link: dto.link ?? '',
      alt: dto.alt,
    });
  }

  async listPublic(): Promise<{ data: BannerRecord[] }> {
    const records = await this.appsScript.fetchRecords('banners');
    const data = records
      .map((record) => this.toBannerRecord(record))
      .filter((record) => record.ativo)
      .sort((a, b) => a.ordem - b.ordem);
    return { data };
  }

  async listAdmin(
    page?: string,
    limit?: string,
  ): Promise<Paginated<BannerRecord>> {
    const records = await this.appsScript.fetchRecords('banners');
    const data = records.map((record) => this.toBannerRecord(record));
    return paginate(data, page, limit);
  }

  async updateMetadata(id: string, dto: UpdateBannerDto): Promise<void> {
    const campos: Record<string, unknown> = {};
    if (dto.ordem !== undefined) campos.ordem = dto.ordem;
    if (dto.ativo !== undefined) campos.ativo = dto.ativo;
    if (dto.link !== undefined) campos.link = dto.link;
    if (dto.alt !== undefined) campos.alt = dto.alt;

    await this.appsScript.updateFields('banners', id, campos);
  }

  async deleteById(id: string): Promise<void> {
    const records = await this.appsScript.fetchRecords('banners');
    const record = records.find((r) => r.id === id);

    await this.appsScript.deleteRecord('banners', id);

    if (record?.cloudinaryPublicId) {
      try {
        await this.cloudinary.deleteImage(record.cloudinaryPublicId);
      } catch {
        // A linha já foi removida da planilha, que é o contrato principal; uma imagem
        // órfã no Cloudinary não é crítica e fica recuperável via a aba "Excluídos".
      }
    }
  }

  private toBannerRecord(
    record: Record<string, string> & { id: string; createdAt: string },
  ): BannerRecord {
    return {
      id: record.id,
      createdAt: record.createdAt,
      imageUrl: record.imageUrl ?? '',
      ordem: Number(record.ordem) || 0,
      ativo: record.ativo === 'true',
      link: record.link ? record.link : null,
      alt: record.alt ?? '',
    };
  }
}
