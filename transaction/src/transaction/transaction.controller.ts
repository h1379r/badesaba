import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { GetUserPayload } from 'src/auth/decorator/get-user-payload.decorator';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { ISC_SECURITY_NAME } from 'src/common/constant/swagger.constant';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { IscAuthGuard } from 'src/auth/guard/isc-auth.guard';
import { Request, Response } from 'express';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getTransaction(
    @Query() getTransactionDto: GetTransactionDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.transactionService.getTransaction(
      getTransactionDto,
      userPayload,
    );
  }

  @Post()
  @ApiSecurity(ISC_SECURITY_NAME)
  @UseGuards(IscAuthGuard)
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get('verify')
  async verifyTransaction(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.transactionService.verifyTransaction(request, response);
  }
}
