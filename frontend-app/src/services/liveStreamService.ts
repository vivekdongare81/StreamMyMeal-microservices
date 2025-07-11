import { liveStreamsData } from '@/data';
import { LiveStream, ChatMessage } from '@/data/types';

export class LiveStreamService {
  static async getLiveStreamByRestaurantId(restaurantId: string): Promise<LiveStream | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return liveStreamsData[restaurantId] || null;
  }

  static async getAllLiveStreams(): Promise<LiveStream[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Object.values(liveStreamsData);
  }

  static async addChatMessage(restaurantId: string, message: ChatMessage): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (liveStreamsData[restaurantId]) {
      liveStreamsData[restaurantId].chatMessages.push(message);
    }
  }
}