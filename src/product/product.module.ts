import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), UserModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'product', method: RequestMethod.GET },
        { path: 'product/:id', method: RequestMethod.GET },
      )
      .forRoutes(ProductController);
  }
}
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'product', method: RequestMethod.GET },
        { path: 'product/:id', method: RequestMethod.GET },
      )
      .forRoutes(ProductController);
  }
}
