import { Product } from 'src/product/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  phone_number: string;

  @Column()
  password: string;

  @OneToMany(() => Product, (product) => product.owner)
  products: Product[];
}
