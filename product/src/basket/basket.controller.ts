import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { BasketService } from './basket.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { AddBookDto } from './dto/add-book.dto';
import { RemoveBookDto } from './dto/remove-book.dto';
import { GetUserPayload } from 'src/auth/decorator/get-user-payload.decorator';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('basket')
@Controller('basket')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get('books')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getBooks(@GetUserPayload() userPayload: IUserPayload) {
    return this.basketService.getBooks(userPayload);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  chkeout(
    @Body() checkoutDto: CheckoutDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.basketService.chkeout(checkoutDto, userPayload);
  }

  @Patch('book/add')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  addBook(
    @Body() addBookDto: AddBookDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.basketService.addBook(addBookDto, userPayload);
  }

  @Patch('book/remove')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  removeBook(
    @Body() removeBookDto: RemoveBookDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.basketService.removeBook(removeBookDto, userPayload);
  }
}
