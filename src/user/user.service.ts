import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/entity';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

interface UserShape {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
@Injectable()
export class UserService {
  private readonly logger = new Logger(User.name);
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  private readonly user: UserShape[] = [
    {
      first_name: 'John',
      last_name: 'Doe',
      password: 'adae23s',
      email: 'example@mail.com',
      phone_number: '12345678912',
      createdAt: new Date(2016, 12),
      updatedAt: new Date(),
    },
    {
      first_name: 'Peter',
      last_name: 'Random',
      password: 'sd23sdf',
      email: 'random@mail.com',
      phone_number: '09876543210',
      createdAt: new Date(2022, 5),
      updatedAt: new Date(2026, 2),
    },
  ];

  async create(createUser: SignUpDto): Promise<User> {
    try {
      const newUser = this.userRepo.create(createUser);
      this.logger.debug('new user created');
      await this.userRepo.save(newUser);
      return newUser;
    } catch (error) {
      this.logger.error(`failed to Create user:\n ${error}`);
      throw new ConflictException('failed to create User');
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('User Not Found');
    }
    return user;
  }
}
