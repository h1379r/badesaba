import { Injectable } from '@nestjs/common';

@Injectable()
export class Ip2locationService {
  async getLocationByIp(ip: string) {
    /**
     * TODO: implement api call
     */

    const location = 'Iran';

    return location;
  }
}
