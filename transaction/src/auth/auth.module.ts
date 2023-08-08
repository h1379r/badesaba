import { Module } from '@nestjs/common';
import { UserAuthGuard } from './guard/user-auth.guard';
import { IscAuthGuard } from './guard/isc-auth.guard';

@Module({
  providers: [UserAuthGuard, IscAuthGuard],
  exports: [UserAuthGuard, IscAuthGuard],
})
export class AuthModule {}
