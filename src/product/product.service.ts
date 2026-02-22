import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './model/product.types';
import { CreateProductDto } from './dto/create.product.dto';
import { ProductResponseDto } from './dto/product.response.dto';

const products: Array<Product> = [
  {
    id: 1,
    name: 'Wireless Mouse',
    price: 24.99,
    createdAt: new Date('2025-10-12T09:15:00Z'),
    updatedAt: new Date('2026-01-05T14:40:00Z'),
  },
  {
    id: 2,
    name: 'Mechanical Keyboard',
    price: 89.5,
    createdAt: new Date('2025-11-02T16:30:00Z'),
    updatedAt: new Date('2025-12-20T11:05:00Z'),
  },
  {
    id: 3,
    name: '27-inch 4K Monitor',
    price: 329.0,
    createdAt: new Date('2025-08-21T08:00:00Z'),
    updatedAt: new Date('2026-02-10T10:22:00Z'),
  },
  {
    id: 4,
    name: 'USB-C Hub (8-in-1)',
    price: 49.99,
    createdAt: new Date('2025-09-15T12:45:00Z'),
    updatedAt: new Date('2026-02-18T09:10:00Z'),
  },
  {
    id: 5,
    name: 'Noise-Canceling Headphones',
    price: 199.99,
    createdAt: new Date('2025-07-03T13:20:00Z'),
    updatedAt: new Date('2026-01-29T17:55:00Z'),
  },
];

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  findAll(): Array<ProductResponseDto> {
    // return products; // why stop here when i can remove the unwanted fields
    const responseList: Array<ProductResponseDto> = [];
    for (const product of products) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, createdAt, ...response } = product;
      responseList.push(response);
    }
    return responseList;
  }

  findOne(id: number): Product {
    const item = products.find((product) => product.id === id);
    if (!item) throw new NotFoundException('Product not found');
    return item;
  }

  createProduct(payload: CreateProductDto): ProductResponseDto {
    const newProduct: Product = {
      createdAt: new Date(),
      updatedAt: new Date(),
      id: products.length + 1,
      ...payload,
    };

    if (!newProduct.name || !newProduct.price) {
      throw new BadRequestException('Invalid data');
    }

    try {
      products.push(newProduct);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, createdAt, ...response } = newProduct;
      return response;
    } catch (err) {
      console.log(err);
      this.logger.error({
        message: 'failed to create product',
        payload,
        timeStamp: new Date(),
      });
      throw new InternalServerErrorException('failed to create product');
    }
  }

  updateProduct(id: number, updatedProduct: CreateProductDto): Product {
    const item = this.findOne(id); // this will throw the not found from abvove if not found
    // update item
    const updatedItem: Product = {
      ...item,
      name: updatedProduct.name || item.name,
      price: updatedProduct.price || item.price,
      updatedAt: new Date(),
    };

    const index = products.findIndex((product) => product.id === id);
    products[index] = updatedItem;
    return products[index];
  }

  removeProduct(id: number): { id: number; name: string } {
    const item = this.findOne(id);
    const index = products.findIndex((product) => product.id === id);
    products.splice(index, 1);
    return { id: item.id, name: item.name };
  }
}
