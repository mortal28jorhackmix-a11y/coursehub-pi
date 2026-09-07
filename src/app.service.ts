import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'coursehub-pi esta en linea:!';
  }
}
