import { Injectable } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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

  findAll() {
    return this.prisma.userDay.findMany({
      orderBy: {
        date: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.userDay.findFirst({
      where: { id },
    });
  }

  async update(id: string, photo?: Express.Multer.File) {
    const photoUrl = await this.cloudinaryService.uploadImage(photo);

    // Increment the points of the user that his id in userDay by 15 points then save the photoUrl in the userDay
    return this.prisma.$transaction([
      this.prisma.userDay.update({
        where: {
          id,
        },
        data: {
          user: {
            points: {
              increment: 15,
            }
          },
          photoUrl,
        },
      }),
    ]);
  }

}
