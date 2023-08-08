import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { GetPublisherDto } from './dto/get-publisher.dto';
import { GetPublishersListDto } from './dto/get-publishers-list.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { AuthzGuard } from 'src/authz/authz.guard';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('publisher')
@Controller('publisher')
export class PublisherController {
  constructor(private publisherService: PublisherService) {}

  @Get()
  getPublisher(@Query() getPublisherDto: GetPublisherDto) {
    return this.publisherService.getPublisher(getPublisherDto);
  }

  @Get('list')
  getPublishersList(@Query() getPublishersListDto: GetPublishersListDto) {
    return this.publisherService.getPublishersList(getPublishersListDto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  createPublisher(@Body() createPublisherDto: CreatePublisherDto) {
    return this.publisherService.createPublisher(createPublisherDto);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  updatePublisher(@Body() updatePublisherDto: UpdatePublisherDto) {
    return this.publisherService.updatePublisher(updatePublisherDto);
  }
}
