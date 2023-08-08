import { UserRoleEnum } from '../enum/user-role.enum';

export interface IUserPayload {
  id: string;
  role: UserRoleEnum;
}
