import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { VoteService } from './vote.service';
import { SetVoteDto } from './dto/set-vote.dto';
import { GetUserPayload } from 'src/auth/decorator/get-user-payload.decorator';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';

@ApiTags('vote')
@Controller('vote')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  setVote(
    @Body() setVoteDto: SetVoteDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.voteService.setVote(setVoteDto, userPayload);
  }
}
