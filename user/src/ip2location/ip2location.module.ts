import { Module } from '@nestjs/common';
import { Ip2locationService } from './ip2location.service';

@Module({
  providers: [Ip2locationService],
  exports: [Ip2locationService],
})
export class Ip2locationModule {}
