import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('admin-login')
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.authService.validateAdmin(body.username, body.password);
    return this.authService.admin_login(admin);
  }

  @Post('user-login')
  async userLogin(@Body() body: { username: string }) {
    const user = await this.authService.validateUser(body.username);
    return this.authService.user_login(user);
  }
}
