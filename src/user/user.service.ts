import {
  Injectable,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  calculatePreAssessment,
  calculateProfitOrLossSummary,
  generateRandomBalanceSheet,
  getLoanApplicationDecision,
} from './accounts/account.utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(user: User): Promise<{ message: string }> {
    try {
      const { email, password, name, businessName, establishYear } = user;
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        return { message: 'User already exists with this email' };
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      await this.userModel.create({
        email,
        password: hashedPassword,
        businessName,
        name: `${name}`,
        establishYear: establishYear,
      });

      return { message: 'User registered successfully' };
    } catch (err) {
      throw new Error('An error occurred while registering the user');
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found with this email');
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid login credentials');
      }
      const payload = {
        userId: user._id,
        email: user.email,
        establishYear: user.establishYear,
        businessName: user.businessName,
      };
      const token = this.jwtService.sign(payload);
      return token;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('An error occurred while logging in');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const users = await this.userModel.find({});
      return users;
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving users: ${error.message}`,
      );
      throw new Error('An error occurred while retrieving users');
    }
  }

  getBalanceSheet(user: User) {
    try {
      // Get the balance sheet from accounting software
      const balanceSheet = generateRandomBalanceSheet(user);
      return balanceSheet;
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving balance sheet: ${error.message}`,
      );
      throw new Error('An error occurred while retrieving users');
    }
  }

  async submitLoanApplication(body: any, user: User) {
    try {
      const profitOrLossSummary = calculateProfitOrLossSummary(
        body.balanceSheet,
      );
      console.log(profitOrLossSummary);
      //Apply rules for loan application
      const data = {
        businessDetails: {
          businessName: user.businessName,
          establishYear: user.establishYear,
          accountProvider: body.accountProvider,
          loanAmount: body.loanAmount,
          profitOrLossSummary,
        },
        preAssessment: calculatePreAssessment(
          body.balanceSheet,
          body.loanAmount,
          profitOrLossSummary,
        ),
      };
      //Call Decision Engine to get the loan application decision

      return getLoanApplicationDecision(data);
    } catch (error) {
      this.logger.error(
        `An error occurred while retrieving users: ${error.message}`,
      );
      throw new Error('An error occurred while retrieving users');
    }
  }
}
