import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
