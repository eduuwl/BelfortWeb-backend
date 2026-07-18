import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<{ token: string; expiresIn: number }> {
    const adminUser = process.env.ADMIN_USER;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminUser || !adminPasswordHash) {
      throw new InternalServerErrorException(
        'ADMIN_USER/ADMIN_PASSWORD_HASH não configurados',
      );
    }

    const senhaValida =
      dto.usuario === adminUser &&
      (await bcrypt.compare(dto.senha, adminPasswordHash));

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = await this.jwtService.signAsync({ sub: dto.usuario });
    return { token, expiresIn: TOKEN_TTL_SECONDS };
  }
}
