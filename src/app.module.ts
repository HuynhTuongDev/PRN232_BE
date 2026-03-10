import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MotorbikeModule } from './motorbike/motorbike.module';
import { RentalModule } from './rental/rental.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogModule } from './blog/blog.module';
import { PromotionModule } from './promotion/promotion.module';
import { PaymentModule } from './payment/payment.module';
import { ChatModule } from './chat/chat.module';
import { SupabaseModule } from './shared/supabase/supabase.module';
import { UploadModule } from './shared/upload/upload.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env' : undefined,
      ignoreEnvFile: process.env.NODE_ENV !== 'development',
    }),
    AuthModule,
    UserModule,
    MotorbikeModule,
    RentalModule,
    PrismaModule,
    BlogModule,
    PromotionModule,
    PaymentModule,
    ChatModule,
    SupabaseModule,
    UploadModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
