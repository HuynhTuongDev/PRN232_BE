import { Injectable, Logger } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;
  private logger: Logger = new Logger('PusherService');

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
    this.logger.log('Pusher service initialized');
  }

  async trigger(channel: string, event: string, data: any) {
    try {
      await this.pusher.trigger(channel, event, data);
      this.logger.log(`Pusher event triggered: ${event} on channel ${channel}`);
    } catch (error) {
      this.logger.error(`Error triggering Pusher event: ${error.message}`);
    }
  }
}
