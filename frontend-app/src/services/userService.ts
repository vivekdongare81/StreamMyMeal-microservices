export interface LoginRequest {
  username: string;
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
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: any[];
  paymentMethod?: string;
  preferences?: any;
}

const API_BASE = '/api/v1';

export const userService = {
  async login({ username, password }: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async register({ username, email, password, address }: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, address })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getProfile(token: string): Promise<ProfileResponse> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(token: string, profile: Partial<ProfileResponse>): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(profile)], { type: 'application/json' }));
    // If profile image is present, append as 'image'
    if ((profile as any).image) {
      formData.append('image', (profile as any).image);
    }
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
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