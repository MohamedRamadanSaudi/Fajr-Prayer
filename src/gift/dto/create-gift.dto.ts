import { IsOptional } from 'class-validator';

export class CreateGiftDto {
  @IsOptional()
  description: string;

  @IsOptional()
  photo?: any;
}