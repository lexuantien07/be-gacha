import {
  HttpException,
  HttpStatus,
  Injectable,
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
    // kiểm tra xem email hay phone đã tồn tại chưa
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new HttpException(
        {
          key: 'EMAIL_EXISTS',
          message: 'Email already exists',
          data: {
            email: dto.email,
          },
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingPhone = await this.userService.findByPhone(dto.phone);
    if (existingPhone) {
      throw new HttpException(
        {
          key: 'PHONE_EXISTS',
          message: 'Phone number already exists',
          data: {
            phone: dto.phone,
          },
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userService.createUser({
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      is_admin: false,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmailOrPhone(dto.email_phone);
    if (!user) {
      throw new HttpException(
        {
          key: 'USER_NOT_FOUND',
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
          data: {},
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const is_matched = await bcrypt.compare(dto.password, user.password);
    if (!is_matched) {
      throw new HttpException(
        {
          key: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          status: HttpStatus.UNAUTHORIZED,
          data: {},
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      email: user.email,
      _id: user._id,
      scope: user.is_admin ? 'admin' : 'user',
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
      throw new HttpException(
        {
          key: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token',
          status: HttpStatus.UNAUTHORIZED,
          data: {},
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findById(payload._id);
    if (!user) {
      throw new HttpException(
        {
          key: 'USER_NOT_FOUND',
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
          data: {},
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const newPayload = {
      email: user.email,
      _id: user._id,
      scope: user.is_admin ? 'admin' : 'user',
    };
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

  async handleAuthMiddleware(authHeaders, scope) {
    try {
      if (!authHeaders) {
        throw 500;
      }
      const token = (authHeaders as string).split(' ')[1];
      const payload = await this.jwtAuthService.verifyAccessToken(token);
      if (scope.includes(payload['scope'])) {
        return payload['_id'];
      } else {
        throw 500;
      }
    } catch (e) {
      console.log('auth error', e);
      throw new HttpException(
        {
          key: 'INVALID_TOKEN',
          message: 'Invalid token',
          status: HttpStatus.BAD_REQUEST,
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
