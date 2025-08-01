import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from './jwt-auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userService.createUser({
      email: dto.email,
      password: hashedPassword,
      is_admin: false,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const is_matched = await bcrypt.compare(dto.password, user.password);
    if (!is_matched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      _id: user._id,
      type: 'access_token',
    };
    return {
      access_token: await this.jwtAuthService.signAccessToken({
        ...payload,
        type: 'access_token',
      }),
      refresh_token: await this.jwtAuthService.signRefreshToken({
        ...payload,
        type: 'refresh_token',
      }),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.jwtAuthService.verifyRefreshToken(
      dto.refreshToken,
    );
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findById(payload._id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newPayload = { email: user.email, _id: user._id };
    return {
      access_token: await this.jwtAuthService.signAccessToken({
        ...newPayload,
        type: 'access_token',
      }),
      refresh_token: await this.jwtAuthService.signRefreshToken({
        ...newPayload,
        type: 'refresh_token',
      }),
    };
  }
}
