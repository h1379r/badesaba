import { delay } from './delay.util';

const retryCodes = [408, 500, 502, 503, 504, 522, 524];

export const retryRequest = async <T>(
  func: Function,
  retries = 0,
  backoff = 300,
): Promise<T> => {
  try {
    return await func();
  } catch (err) {
    const status = err?.response?.status;

    if (retries > 0 && retryCodes.includes(status)) {
      await delay(backoff);

      return retryRequest(func, retries - 1, backoff * 2);
    } else {
      throw err;
    }
  }
};
