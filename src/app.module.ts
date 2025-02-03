import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './user/user.module';
import { DaysModule } from './days/days.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import { ScheduleModule } from '@nestjs/schedule';
import { GiftModule } from './gift/gift.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to your public folder
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve files from the uploads folder
    }),
    AdminModule, AuthModule, UserModule, DaysModule, GiftModule,
    // ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
