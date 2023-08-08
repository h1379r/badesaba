import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { GetAuthorDto } from './dto/get-author.dto';
import { GetAuthorsListDto } from './dto/get-authors-list.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { AuthzGuard } from 'src/authz/authz.guard';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('author')
@Controller('author')
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Get()
  getAuthor(@Query() getAuthorDto: GetAuthorDto) {
    return this.authorService.getAuthor(getAuthorDto);
  }

  @Get('list')
  getAuthorsList(@Query() getAuthorsListDto: GetAuthorsListDto) {
    return this.authorService.getAuthorsList(getAuthorsListDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.createAuthor(createAuthorDto);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  updateAuthor(@Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorService.updateAuthor(updateAuthorDto);
  }
}
