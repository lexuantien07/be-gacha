import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('JWT-auth')
  getUserById(@Req() req: any) {
    return this.userService.infoMe(req.user.userId);
  }

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('JWT-auth')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('JWT-auth')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
