import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async createAdmin() {
    const admin = await this.prisma.admin.findFirst({
      where: { username: 'admin' },
    });

    if (admin) {
      return {
        message: 'Admin already exists',
      };
    }

    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });

    return {
      message: 'Admin created successfully',
    }
  }
}
