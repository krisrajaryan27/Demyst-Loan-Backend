import { Module, NestModule, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { secretKey } from './config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: secretKey.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],

  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  private readonly logger = new Logger(UserModule.name);

  configure() {
    this.logger.log('User Module Configured');
  }
}
