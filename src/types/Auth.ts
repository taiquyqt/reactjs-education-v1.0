
// Credentials cho yêu cầu đăng nhập
export interface Credentials {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  imageUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    roles: string[];
  };
}
