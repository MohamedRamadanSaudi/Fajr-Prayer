import { Injectable } from '@nestjs/common';
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

  async update(id: string, body: UpdateDayDto, photo?: Express.Multer.File) {
    const photoUrl = await this.cloudinaryService.uploadImage(photo);

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: body.userId,
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
        },
      }),
    ]);
  }

}
