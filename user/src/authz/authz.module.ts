import { Module } from '@nestjs/common';
import { AuthzGuard } from './authz.guard';

@Module({
  providers: [AuthzGuard],
})
export class AuthzModule {}
