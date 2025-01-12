import { HttpException, Injectable } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateDayDto } from './dto/update-day.dto';
import * as moment from 'moment-timezone';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DaysService {
  constructor(private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // Helper function to get the current date in Cairo time zone
  private getCurrentDateInCairo(): Date {
    return moment().tz('Africa/Cairo').toDate();
  }

  // Helper function to convert a date to Cairo time zone
  private convertToCairoTime(date: Date): Date {
    return moment(date).tz('Africa/Cairo').toDate();
  }

  create(userId: string) {
    // Get the current date in Cairo time zone
    const today = this.getCurrentDateInCairo();

    // Increment the points of the user and create a new userDay
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          points: {
            increment: 10,
          },
        },
      }),
      this.prisma.userDay.create({
        data: {
          userId,
          wakeUp: true,
          date: today,
        },
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
        pointsIncrement = 20; // Increment points by 20 if a photo is uploaded
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

      // Convert the date to Cairo time zone
      const cairoDate = this.convertToCairoTime(createDayDto.date);

      // Create a new userDay entry
      const userDay = await tx.userDay.create({
        data: {
          wakeUp: createDayDto.wakeUp === true || String(createDayDto.wakeUp).toLowerCase() === "true",
          prayInTheMosque: createDayDto.prayInTheMosque === true || String(createDayDto.prayInTheMosque).toLowerCase() === "true",
          userId: createDayDto.userId,
          date: cairoDate,
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

  async update(id: string, updateUserDto: UpdateDayDto, userId: string, photo?: Express.Multer.File) {
    // Initialize photoUrl as undefined
    let photoUrl: string | undefined;

    // If a photo is provided, upload it
    if (photo) {
      photoUrl = await this.cloudinaryService.uploadImage(photo);
      // Use a transaction to update both the user and the userDay
      return this.prisma.$transaction([
        this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            points: {
              increment: 10,
            },
          },
        }),
        this.prisma.userDay.update({
          where: {
            id,
          },
          data: {
            photo: photoUrl,
            userId: userId,
            date: updateUserDto.date,
            prayInTheMosque: updateUserDto.prayInTheMosque === true || String(updateUserDto.prayInTheMosque).toLowerCase() === "true",
          },
        }),
      ]);
    } else { // update without photo and without transaction
      return this.prisma.userDay.update({
        where: {
          id,
        },
        data: {
          userId: updateUserDto.userId,
          date: updateUserDto.date,
          prayInTheMosque: updateUserDto.prayInTheMosque === true || String(updateUserDto.prayInTheMosque).toLowerCase() === "true",
        },
      });
    }
  }

  // Create default UserDay for users who haven't created it yet by Sunrise
  async createDefaultUserDays() {
    const today = this.getCurrentDateInCairo();
    const startOfDay = moment(today).startOf('day').toDate();
    const endOfDay = moment(today).endOf('day').toDate();

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

  // Create default UserDay for users who haven't created it yet by Sunrise
  @Cron('0 53 06 * * *', {
    timeZone: 'Africa/Cairo'
  })
  async createDefaultUserDaysAutomatically() {
    // Get the current date in Cairo time zone
    const now = moment().tz('Africa/Cairo');
    const startOfDay = now.clone().startOf('day').toDate(); // Start of day in Cairo time zone
    const endOfDay = now.clone().endOf('day').toDate(); // End of day in Cairo time zone

    console.log('Debug timestamps:');
    console.log('Now (Cairo):', now.format('YYYY-MM-DDTHH:mm:ssZ'));
    console.log('Start of day (Cairo):', moment(startOfDay).tz('Africa/Cairo').format('YYYY-MM-DDTHH:mm:ssZ'));
    console.log('End of day (Cairo):', moment(endOfDay).tz('Africa/Cairo').format('YYYY-MM-DDTHH:mm:ssZ'));

    // First check if there are any users at all
    const allUsers = await this.prisma.user.findMany();
    console.log('Total users in system:', allUsers.length);

    // Then check users without days for today
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
      include: {
        UserDay: true,
      },
    });

    console.log('Users without days for today:', users.length);
    if (users.length === 0) {
      const existingEntries = await this.prisma.userDay.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      console.log('Existing entries for today:', existingEntries.length);
    }

    // Create default UserDay entries for users without one for today
    const userDayPromises = users.map((user) =>
      this.prisma.userDay.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: startOfDay, // Use startOfDay for consistency
          },
        },
        update: {},
        create: {
          userId: user.id,
          date: startOfDay, // Use startOfDay for consistency
          wakeUp: false,
          prayInTheMosque: false,
        },
      })
    );

    const result = await Promise.all(userDayPromises);
    console.log('Created default user days:', result.length);
    return result;
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
      pointsDecrement = 20;
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
