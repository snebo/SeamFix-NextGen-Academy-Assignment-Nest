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
    const products = await this.productRepo.find({ relations: ['category'] });
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['owner', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(
    payload: CreateProductDto,
    userId: number,
  ): Promise<Partial<Product>> {
    const { categoryId, ...productData } = payload;
    const newProduct = this.productRepo.create({
      owner: { id: userId } as any,
      category: categoryId ? ({ id: categoryId } as any) : undefined,
      ...productData,
    });

    try {
      // trying to hide the owner info
      const savedProduct = await this.productRepo.save(newProduct);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { owner, ...created_product } = savedProduct;
      return created_product;
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

    const { categoryId, ...productData } = updatedProduct;
    
    Object.assign(product, productData);
    if (categoryId) {
      product.category = { id: categoryId } as any;
    }

    product.updated_at = new Date();

    try {
      return await this.productRepo.save(product);
    } catch (err) {
      this.logger.error({
        message: 'failed to update product',
        product,
        timeStamp: new Date(),
      });
      throw new InternalServerErrorException({
        message: 'failed to update product',
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
    return this.productRepo.find({ where: { owner: { id: userId } } });
  }
}
