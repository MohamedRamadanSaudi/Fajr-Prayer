import { Module } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaysController } from './days.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [CloudinaryModule, ScheduleModule.forRoot()],
  controllers: [DaysController],
  providers: [DaysService, PrismaService, JwtService, CloudinaryService],
})
export class DaysModule { }
