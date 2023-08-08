export const randomNumberString = (length: number): string => {
  const digits = '0123456789';
  let num = '';
  for (let i = 0; i < length; i++) {
    num += digits[Math.floor(Math.random() * 10)];
  }
  return num;
};
