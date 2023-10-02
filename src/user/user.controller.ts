import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { AuthGuard } from './auth.guard';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async signup(@Body() user: User): Promise<{ message: string }> {
    await this.userService.registerUser(user);
    return { message: 'User registered successfully' };
  }

  @Post('login')
  async loginUser(
    @Body() body: { email: string; password: string },
  ): Promise<{ message: string; token: string }> {
    const { email, password } = body;
    const token = await this.userService.loginUser(email, password);
    return { message: 'Login successful', token };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get('/balance-sheet')
  @UseGuards(AuthGuard)
  getBalanceSheet(@Req() req) {
    const user = req.user;
    return this.userService.getBalanceSheet(user);
  }

  @Post('/submit-loan')
  @UseGuards(AuthGuard)
  submitApplication(
    @Body()
    body: { balanceSheet: any; accountProvider: string; loanAmount: string },
    @Req() req,
  ) {
    const user = req.user;
    return this.userService.submitLoanApplication(body, user);
  }
}
