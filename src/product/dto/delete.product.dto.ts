import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteParamsDto {
  @Type(() => Number)
  @IsNumber()
  id: number;
}
