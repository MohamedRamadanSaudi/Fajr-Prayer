import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { DaysService } from './days.service';
import { CreateDayDto } from './dto/create-day.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateDayDto } from './dto/update-day.dto';

@UseGuards(JwtAuthGuard)
@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) { }

  @Post()
  create(@Body() createDayDto: CreateDayDto) {
    return this.daysService.create(createDayDto);
  }

  @Get()
  findAll() {
    return this.daysService.findAll();
  }

  @Get('test-default-days')
  get() {
    return this.daysService.testCreateDefaultUserDays();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.daysService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() body: UpdateDayDto,
  ) {
    return this.daysService.update(id, body, photo);
  }
}
