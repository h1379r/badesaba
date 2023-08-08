export interface ICreateTransactionData {
  success: boolean;
  message: string;
  result: {
    id: string;
    trackId: string;
    url: string;
  };
}
