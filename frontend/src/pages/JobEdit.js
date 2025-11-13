import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobService } from '../services/jobService';
import { ArrowLeft, Plus, X } from 'lucide-react';

const JobEdit = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm();

  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [skillsRequired, setSkillsRequired] = useState(['']);
  const [benefits, setBenefits] = useState(['']);

  // Load existing job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobData = await jobService.getJobById(jobId);
        
        // Set form values
        setValue('title', jobData.title);
        setValue('description', jobData.description);
        setValue('department', jobData.department);
        setValue('location', jobData.location);
        setValue('job_type', jobData.job_type);
        setValue('experience_level', jobData.experience_level);
        setValue('salary_range', jobData.salary_range || '');
        setValue('status', jobData.status);

        // Set arrays
        setRequirements(jobData.requirements?.length > 0 ? jobData.requirements : ['']);
        setResponsibilities(jobData.responsibilities?.length > 0 ? jobData.responsibilities : ['']);
        setSkillsRequired(jobData.skills_required?.length > 0 ? jobData.skills_required : ['']);
        setBenefits(jobData.benefits?.length > 0 ? jobData.benefits : ['']);
      } catch (error) {
        setError('Failed to load job details');
        console.error('Error loading job:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (jobId) {
      loadJob();
    }
  }, [jobId, setValue]);

  const addItem = (array, setArray) => {
    setArray([...array, '']);
  };

  const removeItem = (array, setArray, index) => {
    const newArray = array.filter((_, i) => i !== index);
    setArray(newArray);
  };

  const updateItem = (array, setArray, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty items
      const filteredRequirements = requirements.filter(item => item.trim() !== '');
      const filteredResponsibilities = responsibilities.filter(item => item.trim() !== '');
      const filteredSkills = skillsRequired.filter(item => item.trim() !== '');
      const filteredBenefits = benefits.filter(item => item.trim() !== '');

      const jobData = {
        ...data,
        requirements: filteredRequirements,
        responsibilities: filteredResponsibilities,
        skills_required: filteredSkills,
        benefits: filteredBenefits
      };

      await jobService.updateJob(jobId, jobData);
      setSuccess('Job updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/app/jobs');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        <p className="text-gray-600 mt-2">Update the job posting details below.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                {...register('department', { required: 'Department is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New York, NY"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                {...register('job_type', { required: 'Job type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Job Type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
              {errors.job_type && (
                <p className="mt-1 text-sm text-red-600">{errors.job_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                {...register('experience_level', { required: 'Experience level is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Experience Level</option>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="manager">Manager</option>
              </select>
              {errors.experience_level && (
                <p className="mt-1 text-sm text-red-600">{errors.experience_level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                {...register('salary_range')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Job description is required' })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide a detailed description of the role, responsibilities, and what the ideal candidate should expect..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) => updateItem(requirements, setRequirements, index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a requirement..."
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(requirements, setRequirements, index)}
                  className="ml-2 p-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(requirements, setRequirements)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Requirement
          </button>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h2>
          {responsibilities.map((responsibility, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => updateItem(responsibilities, setResponsibilities, index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a responsibility..."
              />
              {responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(responsibilities, setResponsibilities, index)}
                  className="ml-2 p-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(responsibilities, setResponsibilities)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Responsibility
          </button>
        </div>

        {/* Skills Required */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
          {skillsRequired.map((skill, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateItem(skillsRequired, setSkillsRequired, index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a skill..."
              />
              {skillsRequired.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(skillsRequired, setSkillsRequired, index)}
                  className="ml-2 p-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(skillsRequired, setSkillsRequired)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Skill
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateItem(benefits, setBenefits, index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a benefit..."
              />
              {benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, index)}
                  className="ml-2 p-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(benefits, setBenefits)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Benefit
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/app/jobs')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobEdit; 