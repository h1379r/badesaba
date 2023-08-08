import { Types } from 'mongoose';

export interface ITokenLogoutArgs {
  user: Types.ObjectId;
  refreshToken: string;
}
