import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { GetCategoryDto } from './dto/get-category.dto';
import { GetCategoriesListDto } from './dto/get-categories-list.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { AuthzGuard } from 'src/authz/authz.guard';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getCategory(@Query() getCategoryDto: GetCategoryDto) {
    return this.categoryService.getCategory(getCategoryDto);
  }

  @Get('list')
  getCategoriesList(@Query() getCategoriesListDto: GetCategoriesListDto) {
    return this.categoryService.getCategoriesList(getCategoriesListDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  updateCategory(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(updateCategoryDto);
  }
}
