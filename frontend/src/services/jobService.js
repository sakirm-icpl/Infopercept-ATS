import { apiClient } from './apiClient';

export const jobService = {
    // Get all active jobs (for candidates)
    getActiveJobs: async () => {
        const response = await apiClient.get('/api/jobs/active');
        return response.data;
    },

    // Get all jobs with filtering (for HR/Admin)
    getAllJobs: async (params = {}) => {
        const response = await apiClient.get('/api/jobs', { params });
        return response.data;
    },

    // Get job by ID
    getJobById: async (jobId) => {
        const response = await apiClient.get(`/api/jobs/${jobId}`);
        return response.data;
    },

    // Create new job (HR/Admin only)
    createJob: async (jobData) => {
        const response = await apiClient.post('/api/jobs', jobData);
        return response.data;
    },

    // Update job (HR/Admin only)
    updateJob: async (jobId, jobData) => {
        const response = await apiClient.put(`/api/jobs/${jobId}`, jobData);
        return response.data;
    },

    // Delete job (HR/Admin only)
    deleteJob: async (jobId) => {
        const response = await apiClient.delete(`/api/jobs/${jobId}`);
        return response.data;
    },

    // Close job (HR/Admin only)
    closeJob: async (jobId) => {
        const response = await apiClient.post(`/api/jobs/${jobId}/close`);
        return response.data;
    },

    // Get jobs by department
    getJobsByDepartment: async (department) => {
        const response = await apiClient.get(`/api/jobs/department/${department}`);
        return response.data;
    },
}; 