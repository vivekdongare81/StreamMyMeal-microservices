import { apiClient } from '@/lib/api';

export interface LiveSession {
  id: string;
  restaurantId: string;
  broadcastId: string;
  isLive: boolean;
  viewers: number;
  startTime?: string;
  endTime?: string;
  image?: string;
}

export type LiveRestaurant = {
  restaurantId: number;
  name: string;
  address: string;
  image: string;
  liveSession: {
    broadcastId: string;
    startedAt: string;
    viewersCount: number;
    isLive: boolean;
  };
  // Add other fields as needed
};

export interface LiveStream {
  id: string;
  restaurantId: string;
  title: string;
  viewers: number;
  viewersCount: number;
  isLive: boolean;
  image?: string;
  streamUrl: string;
  chatMessages: any[];
}

export class LiveStreamService {
  private static readonly API_BASE_URL = '/api/v1';

  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };
  }

  static async getLiveSessions(): Promise<LiveSession[]> {
    try {
      return await apiClient.get('/live-sessions', { requiresAuth: false });
    } catch (error) {
      console.error('Failed to fetch live sessions:', error);
      return [];
    }
  }

  static async startSession(restaurantId: string, broadcastId: string): Promise<LiveSession> {
    return apiClient.post('/live-sessions/start', null, {
      params: { restaurantId, broadcastId }
    });
  }

  static async stopSession(restaurantId: string): Promise<void> {
    return apiClient.post('/live-sessions/stop', null, {
      params: { restaurantId }
    });
  }

  static async createSessionForRestaurant(restaurantId: string): Promise<LiveSession> {
    return apiClient.post('/live-sessions/create-for-restaurant', null, {
      params: { restaurantId }
    });
  }

  static async getSessionByRestaurantId(restaurantId: string): Promise<LiveSession | null> {
    try {
      const sessions = await this.getLiveSessions();
      return sessions.find(session => session.restaurantId === restaurantId) || null;
    } catch (error) {
      console.error('Failed to get session by restaurant ID:', error);
      return null;
    }
  }

  static async getLiveRestaurants(): Promise<any[]> {
    // This endpoint returns a list of restaurant objects with liveSession info
    return apiClient.get('/live-sessions/live-restaurants', { requiresAuth: false });
  }
}