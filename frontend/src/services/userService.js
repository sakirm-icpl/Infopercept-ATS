import { apiClient } from './apiClient';

class UserService {
  // Get all users (Admin only)
  async getAllUsers() {
    const response = await apiClient.get('/api/users');
    return response.data;
  }

  // Get users by role
  async getUsersByRole(role) {
    const response = await apiClient.get(`/api/users?role=${role}`);
    return response.data;
  }

  // Get user by ID
  async getUserById(userId) {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  }

  // Create user (Admin only)
  async createUser(userData) {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  }

  // Update user (Admin only)
  async updateUser(userId, userData) {
    const response = await apiClient.put(`/api/users/${userId}`, userData);
    return response.data;
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    await apiClient.delete(`/api/users/${userId}`);
    return { success: true };
  }

  // Get team members for assignment
  async getTeamMembersForAssignment() {
    try {
      console.log('Calling /api/users/assignment-users endpoint...');
      const response = await apiClient.get('/api/users/assignment-users');
      console.log('API response:', response);
      console.log('API response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getTeamMembersForAssignment:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  }

  // Get HR users for assignment
  async getHRUsersForAssignment() {
    const response = await apiClient.get('/api/users?role=hr');
    return response.data;
  }

  // Get available interviewers
  async getAvailableInterviewers() {
    const response = await apiClient.get('/api/users?role=team_member&active=true');
    return response.data;
  }
}

export const userService = new UserService(); 