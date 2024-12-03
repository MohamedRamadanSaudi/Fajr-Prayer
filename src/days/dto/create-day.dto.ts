import { IsNotEmpty, IsString, IsBoolean, IsDate, IsOptional } from 'class-validator';

export class CreateDayDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  wakeUp: boolean;

  @IsOptional()
  photo?: any
}