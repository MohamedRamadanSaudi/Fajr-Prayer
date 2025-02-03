import { Module } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaysController } from './days.controller';
import { FileService } from 'src/common/services/file.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DaysController],
  providers: [DaysService, PrismaService, JwtService, FileService],
})
export class DaysModule { }
