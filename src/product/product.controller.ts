/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Response } from 'express';
import { CreateProductDto } from './dto/create.product.dto';
import { DeleteParamsDto } from './dto/delete.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Product } from './product.entity';

@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(private readonly service: ProductService) {}

  @Get()
  getProducts() {
    this.logger.debug('get all products');
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my_products')
  async getMyProducts(@CurrentUser() user: any): Promise<Product[]> {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    return this.service.getMyProducts(+user.id);
  }

  @Get(':id')
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product> {
    return this.service.findOne(id);
  }

  @Post('')
  async createProduct(
    @Res() res: Response,
    @Body() body: CreateProductDto,
    @CurrentUser() user: any,
  ) {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    const product = await this.service.createProduct(body, user.id);
    res.status(HttpStatus.CREATED).send(product);
  }

  @Patch(':id')
  updateProduct(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    const userId = user.id;
    const product = this.service.updateProduct(id, body, Number(userId));
    res.status(HttpStatus.OK).send(product);
  }

  @Delete(':id')
  deleteProduct(
    @Res() res: Response,
    @Param() params: DeleteParamsDto,
    @CurrentUser() user: any,
  ) {
    const deletedProduct = this.service.removeProduct(params.id, user.id);
    res.status(HttpStatus.OK).send(deletedProduct);
  }
}
