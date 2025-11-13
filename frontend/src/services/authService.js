import { apiClient } from './apiClient';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    const response = await apiClient.post('/api/auth/check-email', { email });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
  },

  // Admin user creation
  async createUser(userData) {
    try {
      const response = await apiClient.post('/api/users', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'User creation failed' 
      };
    }
  },

  // Get all users (Admin only)
  async getAllUsers() {
    try {
      const response = await apiClient.get('/api/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch users' 
      };
    }
  },

  // Update user (Admin only)
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update user' 
      };
    }
  },

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      await apiClient.delete(`/api/users/${userId}`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete user' 
      };
    }
  }
}; 