import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './user/user.module';
import { DaysModule } from './days/days.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    AdminModule, AuthModule, CloudinaryModule, UserModule, DaysModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }
