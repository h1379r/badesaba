import { OrderStatusEnum } from '../enum/order-status.enum';

export interface IOrderTransactionPayload {
  id: string;
  status: OrderStatusEnum;
}
