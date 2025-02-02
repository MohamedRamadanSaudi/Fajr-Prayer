import { Injectable } from '@nestjs/common';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { parse } from 'path';

@Injectable()
export class GiftService {

  constructor(private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create() {
    // check if the gift already exists
    const gift = await this.prisma.gift.findMany();
    if (gift[0]) {
      return {
        message: 'Gift already exists',
      };
    }

    await this.prisma.gift.create({
      data: {
        description: 'Gift description',
        photo: 'default-photo-url',
      },
    });
    return {
      message: 'Gift created successfully',
    }
  }

  async findGift() {
    const gift = await this.prisma.gift.findMany();
    const result = gift[0];
    return {
      photo: result.photo,
      description: result.description,
    }
  }

  async update(updateGiftDto: UpdateGiftDto, photo?: Express.Multer.File) {
    const gift = await this.prisma.gift.findMany();
    const result = gift[0];

    let photoUrl: string;
    if (photo) {
      photoUrl = await this.cloudinaryService.uploadImage(photo);

      if (result.photo) {
        const urlParts = result.photo.split('/'); // Split the URL
        const publicIdWithExtension = urlParts[urlParts.length - 1]; // Get the last part
        const publicId = parse(publicIdWithExtension).name; // Remove the file extension

        await this.cloudinaryService.deleteImage(`uploads/${publicId}`); // Adjust the folder path if necessary
      }
    }

    const updatedGift = await this.prisma.gift.update({
      where: { id: result.id },
      data: {
        description: updateGiftDto.description,
        photo: photoUrl || result.photo,
      },
    });

    return {
      message: 'Gift updated successfully',
      photo: updatedGift.photo,
      description: updatedGift.description,
    }
  }
}
