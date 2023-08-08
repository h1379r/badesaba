import { UserPlanStatusEnum } from '../enum/user-paln-status.enum';

export interface IUserPlanTransactionPayload {
  id: string;
  status: UserPlanStatusEnum;
}
