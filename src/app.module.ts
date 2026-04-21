import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        // ← change the arrow from => ({ to => {

        console.log('DB CONFIG:', {
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          database: configService.get('DB_DATABASE'),
          node_env: configService.get('NODE_ENV'),
        });

        return {
          // ← explicit return instead of implicit ({ })
          type: 'postgres',
          host: configService.getOrThrow<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'development',
        }; // ← close return object
      }, // ← close useFactory
    }),
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
