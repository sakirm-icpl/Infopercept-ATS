import { apiClient } from './apiClient';

export const applicationService = {
  // Get all applications
  getApplications: async () => {
    const response = await apiClient.get('/api/applications');
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id) => {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data;
  },

  // Create new application
  createApplication: async (formData) => {
    const response = await apiClient.post('/api/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update stage 1 feedback
  updateStage1Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/1`, stageData);
    return response.data;
  },

  // Update stage 2 feedback
  updateStage2Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/2`, stageData);
    return response.data;
  },

  // Update stage 3 feedback
  updateStage3Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/3`, stageData);
    return response.data;
  },

  // Update stage 4 feedback
  updateStage4Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/4`, stageData);
    return response.data;
  },

  // Update stage 5 feedback
  updateStage5Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/5`, stageData);
    return response.data;
  },

  // Update stage 6 feedback
  updateStage6Feedback: async (applicationId, stageData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/stage/6`, stageData);
    return response.data;
  },

  // Update final recommendation
  updateFinalRecommendation: async (applicationId, recommendationData) => {
    const response = await apiClient.put(`/api/applications/${applicationId}/final-recommendation`, recommendationData);
    return response.data;
  },

  // Delete application
  deleteApplication: async (id) => {
    const response = await apiClient.delete(`/api/applications/${id}`);
    return response.data;
  },

  // Team Member Methods
  async getMyAssignments() {
    try {
      const response = await apiClient.get('/api/applications/my-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      throw error;
    }
  },

  async submitTeamMemberFeedback(applicationId, stageNumber, feedbackData) {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/stage/${stageNumber}/team-feedback`, feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting team member feedback:', error);
      throw error;
    }
  },

  async forwardStageToHR(applicationId, stageNumber) {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/stage/${stageNumber}/forward`);
      return response.data;
    } catch (error) {
      console.error('Error forwarding stage to HR:', error);
      throw error;
    }
  },

  async assignStageToTeamMember(applicationId, assignmentData) {
    try {
      const response = await apiClient.post(`/api/applications/${applicationId}/assign-stage`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning stage to team member:', error);
      throw error;
    }
  },

  async getStageAssignments(applicationId) {
    try {
      const response = await apiClient.get(`/api/applications/${applicationId}/assignments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stage assignments:', error);
      throw error;
    }
  },

  async approveStageByHR(applicationId, stageNumber) {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/stage/${stageNumber}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving stage:', error);
      throw error;
    }
  },

  async rejectStageByHR(applicationId, stageNumber, reason) {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/stage/${stageNumber}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting stage:', error);
      throw error;
    }
  },

  // Assignment Management Methods
  async getAvailableInterviewers() {
    try {
      const response = await apiClient.get('/api/applications/available-interviewers');
      return response.data;
    } catch (error) {
      console.error('Error fetching available interviewers:', error);
      throw error;
    }
  },

  async getAvailableTeamMembers() {
    try {
      const response = await apiClient.get('/api/users/team-members');
      return response.data;
    } catch (error) {
      console.error('Error fetching available team members:', error);
      throw error;
    }
  },

  async getAvailableHRUsers() {
    try {
      const response = await apiClient.get('/api/applications/available-hr-users');
      return response.data;
    } catch (error) {
      console.error('Error fetching available HR users:', error);
      throw error;
    }
  },

  // Feedback Statistics
  async getFeedbackStatistics(queryParams = '') {
    try {
      const url = queryParams ? `/api/applications/feedback/statistics?${queryParams}` : '/api/applications/feedback/statistics';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      throw error;
    }
  },

  async exportFeedback(applicationId, format = 'csv', candidateName = 'application') {
    try {
      const config = format === 'csv' ? { responseType: 'blob' } : {};
      const response = await apiClient.get(`/api/applications/${applicationId}/feedback/export?format=${format}`, config);
      const safeName = candidateName?.replace(/\s+/g, '_') || 'application';
      const date = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Feedback_${safeName}_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Feedback_${safeName}_${date}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting feedback:', error);
      throw error;
    }
  }
}; 