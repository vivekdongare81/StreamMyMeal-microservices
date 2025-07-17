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

const API_BASE = '/api/v1';

export const userService = {
  async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
    if (!res.ok) {
      let errorMsg = 'Registration failed';
      try {
        const data = await res.json();
        errorMsg = data.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }
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