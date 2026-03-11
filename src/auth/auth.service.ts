import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { async } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    this.logger.debug(`email: ${email}, password: ${password}`);
    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async singUp(createUser: SignUpDto) {
    // prevent duplication
    const existingUser = await this.userService.isExistingUser(
      createUser.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    // has password
    createUser.password = await this.hashPassword(createUser.password);
    const user = await this.userService.create(createUser);
    const payload = { sub: user.id, email: user.email };
    this.logger.debug(`user: ${JSON.stringify(user)}`);
    return { access_token: this.jwtService.sign(payload) };
  }

  async hashPassword(password: string): Promise<string> {
    let password_salt_rounds: number | undefined =
      this.configService.get<number>('PASSWORD_SALT_ROUNDS');
    if (!password_salt_rounds) {
      this.logger.debug('using default salt rounds');
      password_salt_rounds = 10;
    }
    const salted = await bcrypt.hash(password, password_salt_rounds);
    return salted;
  }

  async comparePassword(
    password: string,
    encrypted_password: string,
  ): Promise<boolean> {
    this.logger.debug(
      `password: ${password}, encrypted_password: ${encrypted_password}`,
    );
    const is_match: boolean = await bcrypt.compare(
      password,
      encrypted_password,
    );
    return is_match;
  }
}
