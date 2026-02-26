import { Module } from '@nestjs/common';
import { MotorbikeController } from './motorbike.controller';
import { MotorbikeService } from './motorbike.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [MotorbikeController],
    providers: [MotorbikeService],
    exports: [MotorbikeService],
})
export class MotorbikeModule { }
