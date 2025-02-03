import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/common/services/file.service';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) { }

  async create(createUserDto: CreateUserDto, photo?: Express.Multer.File) {
    let photoUrl = null;
    if (photo) {
      photoUrl = await this.fileService.saveFile(photo);
    }

    return this.prisma.user.create({
      data: {
        photo: photoUrl,
        ...createUserDto,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
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
            prayInTheMosque: true,
            photo: true,
          }
        }
      }
    });

    // Replace null or undefined photo with the default photo path
    const defaultPhotoURL = `${process.env.DEFAULT_PHOTO_URL}/default.png`;
    return users.map(user => ({
      ...user,
      photo: user.photo || defaultPhotoURL,
      UserDay: user.UserDay,
    }));
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        points: 'desc',
      },
      select: {
        id: true,
        name: true,
        photo: true,
        points: true,
      }
    });

    // Replace null or undefined photo with the default photo path
    const defaultPhotoURL = `${process.env.DEFAULT_PHOTO_URL}/default.png`;
    return users.map(user => ({
      ...user,
      photo: user.photo || defaultPhotoURL,
      rank: users.findIndex(u => u.id === user.id) + 1,
    }));

  }

  // get the current user form the token
  async getMe(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        UserDay: true,
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

    // Replace null or undefined photo with the default photo path
    const defaultPhotoURL = `${process.env.DEFAULT_PHOTO_URL}/default.png`;
    return {
      ...user,
      photo: user.photo || defaultPhotoURL,
      UserDay: user.UserDay,
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
            prayInTheMosque: true,
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

    // Replace null or undefined photo with the default photo path
    const defaultPhotoURL = `${process.env.DEFAULT_PHOTO_URL}/default.png`;
    return {
      ...user,
      photo: user.photo || defaultPhotoURL,
      UserDay: user.UserDay,
      rank,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, photo?: Express.Multer.File) {

    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { photo: true },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // Delete old photo if it exists
    if (user?.photo) {
      const urlParts = user.photo.split('/'); // Split the URL
      const fileName = urlParts[urlParts.length - 1]; // Get the file name with extension
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName); // Full path

      await this.fileService.deleteFile(filePath); // Ensure correct path
    }

    let photoUrl: string;
    if (photo) {
      photoUrl = await this.fileService.saveFile(photo);
    }

    updateUserDto.points = Number(updateUserDto.points);
    updateUserDto.totalAmount = Number(updateUserDto.totalAmount);

    const result = await this.prisma.user.update({
      where: { id },
      data: {
        photo: photoUrl || user.photo,
        ...updateUserDto,
      },
    });

    return result;
  }

  async resetAllData() {
    // remove all user days and reset the points and total amount

    // get all user days photos and delete it 
    const userDays = await this.prisma.userDay.findMany({
      select: {
        photo: true,
      }
    });

    for (const userDay of userDays) {
      if (userDay.photo) {

        const urlParts = userDay.photo.split('/'); // Split the URL
        const fileName = urlParts[urlParts.length - 1]; // Get the file name with extension
        const filePath = path.join(__dirname, '..', '..', 'uploads', fileName); // Full path

        await this.fileService.deleteFile(filePath); // Ensure correct path
      }

      await this.prisma.userDay.deleteMany({});

      await this.prisma.user.updateMany({
        data: {
          points: 0,
          totalAmount: 0,
        }
      });
      return {
        message: 'All data reset successfully',
      };
    }
  }
  async remove(id: string) {
    try {
      // Delete related user days
      await this.prisma.userDay.deleteMany({
        where: {
          userId: id,
        },
      });
      // Find the user's photo
      const user = await this.prisma.user.findFirst({
        where: { id },
        select: { photo: true },
      });
      // Delete old photo if it exists
      if (user?.photo) {
        const urlParts = user.photo.split('/'); // Split the URL
        const fileName = urlParts[urlParts.length - 1]; // Get the file name with extension
        const filePath = path.join(__dirname, '..', '..', 'uploads', fileName); // Full path

        await this.fileService.deleteFile(filePath); // Ensure correct path
      }

      // Delete the user
      await this.prisma.user.delete({
        where: {
          id,
        },
      });

      return {
        message: 'User deleted successfully',
      };
    } catch (e) {
      console.error(e); // Log the error for debugging
      throw new HttpException('User not found', 404);
    }
  }
}
