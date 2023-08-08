import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { GetBookDto } from './dto/get-book.dto';
import { GetBooksListDto } from './dto/get-books-list.dto';
import { GetRowBooksDto } from './dto/get-row-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { AuthzGuard } from 'src/authz/authz.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('book')
@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get()
  getBook(@Query() getBookDto: GetBookDto) {
    return this.bookService.getBook(getBookDto);
  }

  @Get('list')
  getBooksList(@Query() getBooksListDto: GetBooksListDto) {
    return this.bookService.getBooksList(getBooksListDto);
  }

  @Get('row')
  getRowBooks(@Query() getRowBooksDto: GetRowBooksDto) {
    return this.bookService.getRowBooks(getRowBooksDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.bookService.createBook(createBookDto);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  updateBook(@Body() updateBookDto: UpdateBookDto) {
    return this.bookService.updateBook(updateBookDto);
  }
}
