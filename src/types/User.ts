export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  imageUrl?: string;
  roles: Role[];
  createdAt?: string;
  updatedAt?: string;
}
