import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  photo?: any;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}