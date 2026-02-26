import { Module } from '@nestjs/common';
import { RentalController } from './rental.controller';
import { RentalService } from './rental.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [RentalController],
    providers: [RentalService],
    exports: [RentalService],
})
export class RentalModule { }
