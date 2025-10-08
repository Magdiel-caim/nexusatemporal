import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get('/auth/users');
    return data.data;
  },
};
