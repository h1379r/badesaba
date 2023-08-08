import { Module } from '@nestjs/common';
import { ZibalService } from './zibal.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ZibalService],
  exports: [ZibalService],
})
export class ZibalModule {}
