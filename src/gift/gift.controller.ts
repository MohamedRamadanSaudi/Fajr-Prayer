import { Controller, Get, Post, Body, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GiftService } from './gift.service';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) { }

  @Post()
  create() {
    return this.giftService.create();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findGift() {
    return this.giftService.findGift();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Body() updateGiftDto: UpdateGiftDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.giftService.update(updateGiftDto, photo);
  }
}
