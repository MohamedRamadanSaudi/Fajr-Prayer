import { IsOptional, IsString } from 'class-validator';

export class UpdateDayDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  date?: Date;

  @IsOptional()
  wakeUp?: boolean;

  @IsOptional()
  prayInTheMosque?: boolean;

  @IsOptional()
  photo?: any
}