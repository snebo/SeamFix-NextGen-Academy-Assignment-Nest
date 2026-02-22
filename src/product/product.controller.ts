import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Response } from 'express';
import { Product } from './model/product.types';
import { CreateProductDto } from './dto/create.product.dto';
import { ProductResponseDto } from './dto/product.response.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('')
  getProducts() {
    return this.service.findAll();
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number): Product {
    return this.service.findOne(id);
  }

  @Post('')
  createProduct(@Res() res: Response, @Body() body: CreateProductDto) {
    const product: ProductResponseDto = this.service.createProduct(body);
    res.status(HttpStatus.CREATED).send(product);
  }

  @Patch(':id')
  updateProduct(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateProductDto,
  ) {
    const product = this.service.updateProduct(id, body);
    res.status(HttpStatus.OK).send(product);
  }

  @Delete(':id')
  deleteProduct(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const deletedProduct = this.service.removeProduct(id);
    res.status(HttpStatus.OK).send(deletedProduct);
  }
}
