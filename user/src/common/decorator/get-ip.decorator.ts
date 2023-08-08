import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { getClientIp } from 'request-ip';

export const GetIp = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();

  return getClientIp(req);
});
