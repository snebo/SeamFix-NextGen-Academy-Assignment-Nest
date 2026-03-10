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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Response } from 'express';
import { Product } from './model/product.types';
import { CreateProductDto } from './dto/create.product.dto';
import { ProductResponseDto } from './dto/product.response.dto';
import { DeleteParamsDto } from './dto/delete.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('')
  getProducts(@CurrentUser() user: any) {
    if (!user) {
      throw new UnauthorizedException('please login');
    }
    return this.service.findAll();
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number): Product {
    return this.service.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('')
  createProduct(@Res() res: Response, @Body() body: CreateProductDto) {
    const product: ProductResponseDto = this.service.createProduct(body);
    res.status(HttpStatus.CREATED).send(product);
  }

  @Patch(':id')
  updateProduct(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    const product = this.service.updateProduct(id, body);
    res.status(HttpStatus.OK).send(product);
  }

  @Delete(':id')
  deleteProduct(@Res() res: Response, @Param() params: DeleteParamsDto) {
    const deletedProduct = this.service.removeProduct(params.id);
    res.status(HttpStatus.OK).send(deletedProduct);
  }
}
