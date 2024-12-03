import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards, Delete } from '@nestjs/common';
import { DaysService } from './days.service';
import { CreateDayDto } from './dto/create-day.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateDayDto } from './dto/update-day.dto';

@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDayDto: CreateDayDto) {
    return this.daysService.create(createDayDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  @UseInterceptors(FileInterceptor('photo'))
  createByAdmin(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createDayDto: CreateDayDto
  ) {
    return this.daysService.createByAdmin(createDayDto, photo);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.daysService.findAll();
  }

  @Get('default-days')
  get() {
    return this.daysService.createDefaultUserDays();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.daysService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() body: UpdateDayDto,
  ) {
    return this.daysService.update(id, body, photo);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.daysService.remove(id);
  }
}
