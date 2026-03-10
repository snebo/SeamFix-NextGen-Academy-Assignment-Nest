import {
  Controller,
  Delete,
  Get,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './entities/entity';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async findAll(@CurrentUser() user: any): Promise<User[]> {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@CurrentUser() user: any, @Param('id') id: number) {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    return this.userService.findById(Number(id));
  }

  @Delete(':id')
  async deleteUser(@CurrentUser() user: any, @Param('id') id: number) {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    return this.userService.deleteUser(Number(id));
  }
}
