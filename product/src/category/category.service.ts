import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesListDto } from './dto/get-categories-list.dto';
import { GetCategoryDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getCategory(getCategoryDto: GetCategoryDto) {
    const filter: FilterQuery<Category> = {};

    if (getCategoryDto.id) {
      filter._id = new Types.ObjectId(getCategoryDto.id);
    } else {
      filter.slug = getCategoryDto.slug;
    }

    const category = await this.categoryModel.findOne(filter).lean().exec();

    if (!category) {
      throw new BadRequestException('Not found category');
    }

    return category;
  }

  async getCategoriesList(getCategoriesListDto: GetCategoriesListDto) {
    const filter: FilterQuery<Category> = {};

    // create result query
    const resultPromise = this.categoryModel
      .find(filter, { parent: 1, slug: 1, title: 1, icon: 1 })
      .sort({ _id: -1 })
      .skip(getCategoriesListDto.offset)
      .limit(getCategoriesListDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.categoryModel.countDocuments({}).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    let parent: Types.ObjectId;

    if (createCategoryDto.parent) {
      parent = new Types.ObjectId(createCategoryDto.parent);

      const parentsCount = await this.categoryModel
        .countDocuments({ parent })
        .exec();

      // check that parent is exists
      if (parentsCount) {
        throw new BadRequestException('Not found parent');
      }
    }

    const slugsCount = await this.categoryModel
      .countDocuments({
        slug: createCategoryDto.slug,
      })
      .exec();

    // check is slug unique
    if (slugsCount) {
      throw new BadRequestException('Duplicate slug');
    }

    // insert category
    const insertCategoryResult = await this.categoryModel.create({
      parent,
      slug: createCategoryDto.slug,
      title: createCategoryDto.title,
      icon: createCategoryDto.icon,
    });

    return { id: insertCategoryResult._id.toHexString() };
  }

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    const _id = new Types.ObjectId(updateCategoryDto.id);

    const categoriesCount = await this.categoryModel
      .countDocuments({ _id })
      .exec();

    // check that category is exists
    if (!categoriesCount) {
      throw new BadRequestException('Not found category');
    }

    let parent: Types.ObjectId;

    if (updateCategoryDto.parent) {
      // check parent value is valid
      if (updateCategoryDto.parent === updateCategoryDto.id) {
        throw new BadRequestException('Invalid parent');
      }

      parent = new Types.ObjectId(updateCategoryDto.parent);

      const parentsCount = await this.categoryModel
        .countDocuments({ parent })
        .exec();

      // check that parent is exists
      if (parentsCount) {
        throw new BadRequestException('Not found parent');
      }
    }

    // update category
    await this.categoryModel.updateOne(
      { _id },
      {
        $set: {
          parent,
          title: updateCategoryDto.title,
          icon: updateCategoryDto.icon,
        },
      },
    );

    return { id: updateCategoryDto.id };
  }
}
