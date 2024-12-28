import { IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';

export class CreateDayDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsBoolean()
  wakeUp?: boolean;

  @IsOptional()
  prayInTheMosque?: boolean;

  @IsOptional()
  photo?: any
}