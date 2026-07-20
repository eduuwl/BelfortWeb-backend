import { Module } from '@nestjs/common';
import { AppsScriptModule } from '../apps-script/apps-script.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AdminBannersController } from './admin-banners.controller';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [AppsScriptModule, CloudinaryModule],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
})
export class BannersModule {}
