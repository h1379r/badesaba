import { Types } from 'mongoose';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export interface ITokenLoginArgs {
  user: Types.ObjectId;
  role: UserRoleEnum;
  ip: string;
  userAgent: string;
}
