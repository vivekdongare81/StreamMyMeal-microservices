import { apiClient } from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  address: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export interface ProfileResponse {
  userId: number; // <-- ensure this matches backend type
  username: string;
  email: string;
  address?: string;
  profileImageUrl?: string;
  newJwtToken?: string;
}

export const userService = {
  async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', { email, password }, { requiresAuth: false });
  },

  async register({ username, email, password, address }: RegisterRequest): Promise<AuthResponse> {
    try {
      return await apiClient.post('/auth/register', { username, email, password, address }, { requiresAuth: false });
    } catch (error: any) {
      let errorMsg = 'Registration failed';
      if (error.message) {
        errorMsg = error.message;
      }
      throw new Error(errorMsg);
    }
  },

  async getProfile(token: string): Promise<ProfileResponse> {
    return apiClient.get('/users/profile');
  },

  async updateProfile(token: string, profile: Partial<ProfileResponse>): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(profile)], { type: 'application/json' }));
    // If profile image is present, append as 'image'
    if ((profile as any).image) {
      formData.append('image', (profile as any).image);
    }
    return apiClient.upload('/users/profile', formData, { method: 'PUT' });
  },

  async updateProfileById(userId: number, token: string, profile: Partial<ProfileResponse>): Promise<ProfileResponse> {
    return apiClient.put(`/users/${userId}`, profile);
  },

  logout() {
    localStorage.removeItem('token');
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}; 