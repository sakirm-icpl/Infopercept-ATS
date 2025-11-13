import { apiClient } from './apiClient';

class InterviewService {
  // Stage Assignment Management
  async assignStage(applicationId, assignmentData) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/assign-stage`, assignmentData);
    return response.data;
  }

  async getStageAssignments(applicationId) {
    const response = await apiClient.get(`/api/interviews/applications/${applicationId}/assignments`);
    return response.data;
  }

  async getMyAssignments() {
    const response = await apiClient.get('/api/interviews/my-assignments');
    return response.data;
  }

  // Stage Feedback Submission
  async submitStage1Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage1`, feedback);
    return response.data;
  }

  async submitStage2Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage2`, feedback);
    return response.data;
  }

  async submitStage3Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage3`, feedback);
    return response.data;
  }

  async submitStage4Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage4`, feedback);
    return response.data;
  }

  async submitStage5Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage5`, feedback);
    return response.data;
  }

  async submitStage6Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage6`, feedback);
    return response.data;
  }

  async submitStage7Feedback(applicationId, feedback) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/stage7`, feedback);
    return response.data;
  }

  // Stage Progression
  async forwardToNextStage(applicationId) {
    const response = await apiClient.post(`/api/interviews/applications/${applicationId}/forward-stage`);
    return response.data;
  }

  async getStageStatus(applicationId) {
    const response = await apiClient.get(`/api/interviews/applications/${applicationId}/stage-status`);
    return response.data;
  }

  // Helper methods for stage data validation
  validateStage1Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.panel_feedback) throw new Error('Panel feedback is required');
    if (!data.panel_comments) throw new Error('Panel comments are required');
    if (!data.communication_skills) throw new Error('Communication skills rating is required');
    if (!data.scale || data.scale < 1 || data.scale > 10) throw new Error('Scale must be between 1 and 10');
    if (!data.reason_for_scale) throw new Error('Reason for scale is required');
    if (!data.outcome) throw new Error('Outcome is required');
  }

  validateStage2Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.completion_status) throw new Error('Completion status is required');
    if (!data.reviewer_comments) throw new Error('Reviewer comments are required');
    if (!data.test_result) throw new Error('Test result is required');
  }

  validateStage3Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.feedback) throw new Error('Feedback is required');
    if (!data.scale || data.scale < 1 || data.scale > 10) throw new Error('Scale must be between 1 and 10');
    if (!data.reason_for_scale) throw new Error('Reason for scale is required');
    if (!data.outcome) throw new Error('Outcome is required');
  }

  validateStage4Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.feedback) throw new Error('Feedback is required');
    if (!data.scale || data.scale < 1 || data.scale > 10) throw new Error('Scale must be between 1 and 10');
    if (!data.reason_for_scale) throw new Error('Reason for scale is required');
    if (!data.outcome) throw new Error('Outcome is required');
    if (!data.communication_rating || data.communication_rating < 1 || data.communication_rating > 5) throw new Error('Communication rating must be between 1 and 5');
    if (!data.cultural_fit_rating || data.cultural_fit_rating < 1 || data.cultural_fit_rating > 5) throw new Error('Cultural fit rating must be between 1 and 5');
    if (!data.passion_rating || data.passion_rating < 1 || data.passion_rating > 5) throw new Error('Passion rating must be between 1 and 5');
    if (!data.leadership_potential_rating || data.leadership_potential_rating < 1 || data.leadership_potential_rating > 5) throw new Error('Leadership potential rating must be between 1 and 5');
    if (!data.learning_agility_rating || data.learning_agility_rating < 1 || data.learning_agility_rating > 5) throw new Error('Learning agility rating must be between 1 and 5');
  }

  validateStage5Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.feedback) throw new Error('Feedback is required');
    if (!data.scale || data.scale < 1 || data.scale > 10) throw new Error('Scale must be between 1 and 10');
    if (!data.reason_for_scale) throw new Error('Reason for scale is required');
    if (!data.outcome) throw new Error('Outcome is required');
  }

  validateStage6Data(data) {
    if (!data.panel_name) throw new Error('Panel name is required');
    if (!data.feedback) throw new Error('Feedback is required');
    if (!data.scale || data.scale < 1 || data.scale > 10) throw new Error('Scale must be between 1 and 10');
    if (!data.reason_for_scale) throw new Error('Reason for scale is required');
    if (!data.outcome) throw new Error('Outcome is required');
  }

  validateStage7Data(data) {
    if (!data.status) throw new Error('Status is required');
    if (!data.cumulative_scale || data.cumulative_scale < 1 || data.cumulative_scale > 10) throw new Error('Cumulative scale must be between 1 and 10');
    if (!data.suggestions) throw new Error('Suggestions are required');
  }

  // Get stage information
  getStageInfo(stageNumber) {
    const stages = {
      1: {
        name: 'HR Screening',
        description: 'Initial screening with MCQ test and communication assessment'
      },
      2: {
        name: 'Hands-On Practical LAB Test',
        description: 'Technical coding/assessment'
      },
      3: {
        name: 'Technical Round',
        description: 'Technical interview with detailed feedback'
      },
      4: {
        name: 'HR Round',
        description: 'HR interview with comprehensive ratings'
      },
      5: {
        name: 'BU Lead Interview',
        description: 'Business Unit Lead interview'
      },
      6: {
        name: 'CEO Interview',
        description: 'Final CEO interview'
      },
      7: {
        name: 'Final Recommendation & Offer',
        description: 'Final decision and recommendations'
      }
    };
    return stages[stageNumber] || { name: `Stage ${stageNumber}`, description: '' };
  }
}

export const interviewService = new InterviewService();