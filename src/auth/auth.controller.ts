import {
  Controller,
  Param,
  Delete,
  Post,
  HttpStatus,
  HttpCode,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() login_creds: LogInDto) {
    return this.authService.login(login_creds.email, login_creds.password);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() singup_creds: SignUpDto) {
    return this.authService.singUp(singup_creds);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
