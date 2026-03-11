import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UserService } from 'src/user/user.service';

// const products: Array<Product> = [
//   {
//     id: 1,
//     name: 'Wireless Mouse',
//     price: 24.99,
//     createdAt: new Date('2025-10-12T09:15:00Z'),
//     updatedAt: new Date('2026-01-05T14:40:00Z'),
//   },
//   {
//     id: 2,
//     name: 'Mechanical Keyboard',
//     price: 89.5,
//     createdAt: new Date('2025-11-02T16:30:00Z'),
//     updatedAt: new Date('2025-12-20T11:05:00Z'),
//   },
//   {
//     id: 3,
//     name: '27-inch 4K Monitor',
//     price: 329.0,
//     createdAt: new Date('2025-08-21T08:00:00Z'),
//     updatedAt: new Date('2026-02-10T10:22:00Z'),
//   },
//   {
//     id: 4,
//     name: 'USB-C Hub (8-in-1)',
//     price: 49.99,
//     createdAt: new Date('2025-09-15T12:45:00Z'),
//     updatedAt: new Date('2026-02-18T09:10:00Z'),
//   },
//   {
//     id: 5,
//     name: 'Noise-Canceling Headphones',
//     price: 199.99,
//     createdAt: new Date('2025-07-03T13:20:00Z'),
//     updatedAt: new Date('2026-01-29T17:55:00Z'),
//   },
// ];

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly userService: UserService,
  ) {}
  async findAll(): Promise<Product[]> {
    // return products; // why stop here when i can remove the unwanted fields
    // const responseList: Array<ProductResponseDto> = [];
    // for (const product of products) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const { updatedAt, createdAt, ...response } = product;
    //   responseList.push(response);
    // }
    // return responseList;

    const products = await this.productRepo.find();
    return products;
  }

  async findOne(id: number): Promise<Product> {
    // const item = products.find((product) => product.id === id);
    // if (!item) throw new NotFoundException('Product not found');
    // return item;
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(payload: CreateProductDto, userId): Promise<Product> {
    const user = await this.userService.findById(userId);

    const newProduct = this.productRepo.create({
      owner: user,
      ...payload,
    });

    try {
      return await this.productRepo.save(newProduct);
    } catch (err) {
      this.logger.error({
        message: 'failed to create product',
        payload,
        timeStamp: new Date(),
      });
      throw new InternalServerErrorException({
        message: 'failed to create product',
        error: `${err}`,
        timeStamp: new Date(),
      });
    }
  }

  async updateProduct(
    id: number,
    updatedProduct: UpdateProductDto,
    userId: number,
  ) {
    // get product
    const product = await this.findOne(id);

    if (userId !== product.owner.id) {
      throw new UnauthorizedException(
        'You are not allowed to update this product',
      );
    }
    const updatedItem = {
      ...product,
      name: updatedProduct.name || product.name,
      price: updatedProduct.price || product.price,
      updated_at: new Date(),
    };
    try {
      return await this.productRepo.update(id, updatedItem);
    } catch (err) {
      this.logger.error({
        message: 'failed to create product',
        updatedItem,
        timeStamp: new Date(),
      });
      throw new InternalServerErrorException({
        message: 'failed to create product',
        error: `${err}`,
        timeStamp: new Date(),
      });
    }
  }

  async removeProduct(id: number, userId: number) {
    const product: Product = await this.findOne(id);
    if (product.owner.id !== userId) {
      throw new UnauthorizedException(
        'You are not allowed to delete this product',
      );
    }
    return await this.productRepo.delete(id);
  }

  async getMyProducts(userId: number): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter((product) => product.owner.id === userId);
  }
}
