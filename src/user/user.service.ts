import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createUserDto: CreateUserDto, photo?: Express.Multer.File) {
    let photoUrl = null;
    if (photo) {
      photoUrl = await this.cloudinaryService.uploadImage(photo);
    }

    return this.prisma.user.create({
      data: {
        photo: photoUrl,
        ...createUserDto,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        points: 'desc',
      },
      select: {
        id: true,
        name: true,
        photo: true,
        points: true,
        totalAmount: true,
        UserDay: {
          select: {
            id: true,
            date: true,
            wakeUp: true,
            photo: true,
          }
        }
      }
    });
  }

  // get the current user form the token
  async getMe(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    const users = await this.prisma.user.findMany({
      orderBy: {
        points: 'desc',
      },
    });

    const rank = users.findIndex((u) => u.id === user.id) + 1;

    return {
      ...user,
      rank,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        photo: true,
        points: true,
        totalAmount: true,
        UserDay: {
          select: {
            id: true,
            date: true,
            wakeUp: true,
            photo: true,
          }
        }
      }
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const users = await this.prisma.user.findMany({
      orderBy: {
        points: 'desc',
      },
    });

    const rank = users.findIndex((u) => u.id === user.id) + 1;

    return {
      rank,
      ...user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, photo?: Express.Multer.File) {

    let photoUrl: string;
    if (photo) {
      photoUrl = await this.cloudinaryService.uploadImage(photo);
    }

    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { photo: true },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (user?.photo) {
      this.cloudinaryService.deleteImage(user?.photo);
    }

    updateUserDto.points = Number(updateUserDto.points);
    updateUserDto.totalAmount = Number(updateUserDto.totalAmount);

    const result = await this.prisma.user.update({
      where: { id },
      data: {
        photo: photoUrl,
        ...updateUserDto,
      },
    });

    return result;
  }

  async remove(id: string) {
    // delete the user days and the user and return massage deleted successfully and if no user return user not found
    try {
      await this.prisma.userDay.deleteMany({
        where: {
          userId: id,
        },
      });

      await this.prisma.user.delete({
        where: {
          id,
        },
      });

      return {
        message: 'User deleted successfully',
      }
    } catch (e) {
      throw new HttpException('User not found', 404);
      console.log(e);
    }
  }
}
