import { IsNotEmpty, IsString, IsBoolean, IsDate } from 'class-validator';

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
}