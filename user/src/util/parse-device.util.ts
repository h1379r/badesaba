import { parse } from 'platform';

export const parseDevice = (userAgent: string) =>
  parse(userAgent).description.replace(' on ', ' / ');
