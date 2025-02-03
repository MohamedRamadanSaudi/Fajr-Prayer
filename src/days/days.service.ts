import { HttpException, Injectable } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/common/services/file.service';
import { UpdateDayDto } from './dto/update-day.dto';
import * as moment from 'moment-timezone';
import { Cron } from '@nestjs/schedule';
import * as path from 'path';

@Injectable()
export class DaysService {
  constructor(private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) { }

  // Helper function to get the current date in Cairo time zone (date only)
  private getCurrentDateInCairo(): Date {
    // Set the time to 12:00 PM (noon) to avoid UTC conversion issues
    return moment().tz('Africa/Cairo').hour(12).minute(0).second(0).millisecond(0).toDate();
  }

  private convertToCairoTime(date: Date): Date {
    // Set the time to 12:00 PM (noon) to avoid UTC conversion issues
    return moment(date).tz('Africa/Cairo').hour(12).minute(0).second(0).millisecond(0).toDate();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = moment(date1).tz('Africa/Cairo');
    const d2 = moment(date2).tz('Africa/Cairo');
    return d1.format('YYYY-MM-DD') === d2.format('YYYY-MM-DD');
  }

  async create(userId: string) {
    const today = this.getCurrentDateInCairo();

    const existingEntries = await this.prisma.userDay.findMany({
      where: { userId },
    });

    const hasEntryForToday = existingEntries.some(entry =>
      this.isSameDay(entry.date, today)
    );

    if (hasEntryForToday) {
      throw new HttpException('Entry already exists for today', 400);
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } },
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

  async createByAdmin(createDayDto: CreateDayDto, photo?: Express.Multer.File) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: createDayDto.userId },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const existingEntries = await tx.userDay.findMany({
        where: { userId: createDayDto.userId },
      });

      const cairoDate = this.convertToCairoTime(createDayDto.date);
      const hasEntryForDay = existingEntries.some(entry =>
        this.isSameDay(entry.date, cairoDate)
      );

      if (hasEntryForDay) {
        throw new HttpException('Entry already exists for this day', 400);
      }

      let photoUrl = null;
      let pointsIncrement = 0;
      let totalAmount = 5;

      if (createDayDto.wakeUp === true || String(createDayDto.wakeUp).toLowerCase() === "true") {
        pointsIncrement = 10;
        totalAmount = 0;
      }

      if (photo) {
        photoUrl = await this.fileService.saveFile(photo);
        pointsIncrement = 20;
      }

      await tx.user.update({
        where: { id: createDayDto.userId },
        data: {
          points: { increment: pointsIncrement },
          totalAmount: { increment: totalAmount },
        },
      });

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

    return day;
  }

  async update(id: string, updateUserDto: UpdateDayDto, userId: string, photo?: Express.Multer.File) {
    // Initialize photoUrl as undefined
    let photoUrl: string | undefined;

    // If a photo is provided, upload it
    if (photo) {
      photoUrl = await this.fileService.saveFile(photo);
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

    const users = await this.prisma.user.findMany({
      include: {
        UserDay: true,
      },
    });

    const usersNeedingEntry = users.filter(user =>
      !user.UserDay.some(day => this.isSameDay(day.date, today))
    );

    const userDayPromises = usersNeedingEntry.map((user) =>
      this.prisma.$transaction([
        // Update the user's totalAmount if wakeUp is false
        this.prisma.user.update({
          where: { id: user.id },
          data: {
            totalAmount: { increment: 5 }, // Increment totalAmount by 5
          },
        }),
        // Create the default UserDay entry
        this.prisma.userDay.create({
          data: {
            userId: user.id,
            date: today,
            wakeUp: false,
            prayInTheMosque: false,
          },
        }),
      ])
    );

    return Promise.all(userDayPromises);
  }

  @Cron('0 50 6 * * *', {
    timeZone: 'Africa/Cairo',
  })
  async createDefaultUserDaysAutomatically() {
    console.log("Starting cron job to create default UserDays for users.");
    try {
      await this.createDefaultUserDays();
      console.log("Default UserDays created successfully.");
    } catch (error) {
      console.error("Error creating default UserDays:", error);
    }
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
      const urlParts = day.photo.split('/'); // Split the URL
      const fileName = urlParts[urlParts.length - 1]; // Get the file name with extension
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName); // Full path

      await this.fileService.deleteFile(filePath); // Ensure correct path
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
