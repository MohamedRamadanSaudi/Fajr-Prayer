import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { MorganInterceptor } from 'nest-morgan';

@UseInterceptors(MorganInterceptor('combined'))
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/wake-up')
  wakeUp() {
    return { status: 'Server is awake and ready!' };
  }
}
