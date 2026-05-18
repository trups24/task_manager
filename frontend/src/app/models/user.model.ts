export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  token?: string;
  createdAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}