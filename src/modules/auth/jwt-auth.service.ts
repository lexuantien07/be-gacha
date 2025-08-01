import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signAccessToken(payload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async signRefreshToken(payload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.decode(token);
      if (!payload || payload.type !== 'refresh_token') {
        return null;
      }
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }
}
