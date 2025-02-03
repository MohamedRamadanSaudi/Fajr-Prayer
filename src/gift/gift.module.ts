import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { FileService } from 'src/common/services/file.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [GiftController],
  providers: [GiftService, PrismaService, JwtService, FileService],
})
export class GiftModule { }
