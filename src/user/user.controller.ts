import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.userService.create(createUserDto, photo);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.userService.getLeaderboard();
  }

  @Get('me')
  getMe(
    @Req() req: any
  ) {
    const username = req.user.username;
    return this.userService.getMe(username);
  }

  // remove all user's days
  @Delete('reset-all-data')
  resetAllData() {
    return this.userService.resetAllData();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto
  ) {

    return this.userService.update(id, updateUserDto, photo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // remove all user's days
  @Delete(':id/days')
  removeAllDays(
    @Param('id') id: string
  ) {
    return this.userService.removeAllDays(id);
  }
}