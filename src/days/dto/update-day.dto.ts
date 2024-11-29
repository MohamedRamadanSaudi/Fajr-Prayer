import { IsOptional, IsString } from 'class-validator';

export class UpdateDayDto {
  @IsOptional()
  photo?: any

  @IsOptional()
  @IsString()
  userId?: string
}