import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'GoRide API Gateway - Welcome!';
  }
}
