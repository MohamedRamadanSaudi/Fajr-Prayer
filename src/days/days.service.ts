import { HttpException, Injectable } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateDayDto } from './dto/update-day.dto';

@Injectable()
export class DaysService {
  constructor(private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  create(createDayDto: CreateDayDto) {
    // Increment the points of the user that his id in createDayDto by 10 points then create a new userDay
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: createDayDto.userId,
        },
        data: {
          points: {
            increment: 10,
          },
        },
      }),
      this.prisma.userDay.create({
        data: createDayDto,
      }),
    ]);
  }

  createByAdmin(createDayDto: CreateDayDto, photo?: Express.Multer.File) {
    return this.prisma.$transaction(async (tx) => {
      // Check if the user exists
      const user = await tx.user.findUnique({
        where: {
          id: createDayDto.userId,
        },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      let photoUrl = null;
      let pointsIncrement = 0;
      let totalAmount = 5;
      if (createDayDto.wakeUp === true || String(createDayDto.wakeUp).toLowerCase() === "true") {
        pointsIncrement = 10;
        totalAmount = 0;
      }

      // If a photo is provided, upload it to Cloudinary
      if (photo) {
        photoUrl = await this.cloudinaryService.uploadImage(photo);
        pointsIncrement = 25; // Increment points by 25 if a photo is uploaded
      }

      // Increment user's points
      await tx.user.update({
        where: {
          id: createDayDto.userId,
        },
        data: {
          points: {
            increment: pointsIncrement,
          },
          totalAmount: {
            increment: totalAmount,
          },
        },
      });

      // Create a new userDay entry
      const userDay = await tx.userDay.create({
        data: {
          wakeUp: createDayDto.wakeUp === true || String(createDayDto.wakeUp).toLowerCase() === "true",
          prayInTheMosque: createDayDto.prayInTheMosque === true || String(createDayDto.prayInTheMosque).toLowerCase() === "true",
          userId: createDayDto.userId,
          date: createDayDto.date,
          photo: photoUrl,
        },
      });

      return userDay;
    });
  }

  findAll() {
    return this.prisma.userDay.findMany({
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const day = await this.prisma.userDay.findFirst({
      where: { id },
    });

    if (!day) {
      throw new HttpException('Day not found', 404);

    }
  }

  async update(id: string, updateUserDto: UpdateDayDto, photo?: Express.Multer.File) {
    // Initialize photoUrl as undefined
    let photoUrl: string | undefined;

    // If a photo is provided, upload it
    if (photo) {
      photoUrl = await this.cloudinaryService.uploadImage(photo);
    }

    // Use a transaction to update both the user and the userDay
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: updateUserDto.userId,
        },
        data: {
          points: {
            increment: 15,
          },
        },
      }),
      this.prisma.userDay.update({
        where: {
          id,
        },
        data: {
          photo: photoUrl,
          userId: updateUserDto.userId,
          date: updateUserDto.date,
          prayInTheMosque: updateUserDto.prayInTheMosque === true || String(updateUserDto.prayInTheMosque).toLowerCase() === "true",
        },
      }),
    ]);
  }

  async updateByAdmin(id: string, updateUserDto: UpdateDayDto, photo?: Express.Multer.File) {
    const photoUrl = await this.cloudinaryService.uploadImage(photo);

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: updateUserDto.userId,
        },
        data: {
          points: {
            increment: 15,
          },
        },
      }),
      this.prisma.userDay.update({
        where: {
          id,
        },
        data: {
          photo: photoUrl,
          userId: updateUserDto.userId,
          date: updateUserDto.date,
          wakeUp: updateUserDto.wakeUp === true || String(updateUserDto.wakeUp).toLowerCase() === "true",
          prayInTheMosque: updateUserDto.prayInTheMosque === true || String(updateUserDto.prayInTheMosque).toLowerCase() === "true",
        },
      }),
    ]);
  }

  // Create default UserDay for users who haven't created it yet by Sunrise
  async createDefaultUserDays() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const users = await this.prisma.user.findMany({
      where: {
        UserDay: {
          none: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
    });

    const userDayPromises = users.map((user) =>
      this.prisma.userDay.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        update: {},
        create: {
          userId: user.id,
          date: today,
          wakeUp: false,
          prayInTheMosque: false,
        },
      })
    );


    return Promise.all(userDayPromises);
  }

  async remove(id: string) {
    const day = await this.prisma.userDay.findFirst({
      where: { id },
    });

    if (!day) {
      throw new HttpException('Day not found', 404);
    }
    let pointsDecrement = 0;
    if (day.photo) {
      pointsDecrement = 25;
    } else {
      if (day.wakeUp) {
        pointsDecrement = 10;
      } else {
        pointsDecrement = 0;
      }
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: day.userId,
        },
        data: {
          points: {
            decrement: pointsDecrement,
          },
        },
      }),
      this.prisma.userDay.delete({
        where: {
          id,
        },
      }),
    ]);
  }

}
