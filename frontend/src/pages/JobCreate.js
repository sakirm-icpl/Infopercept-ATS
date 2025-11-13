import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobService } from '../services/jobService';
import { ArrowLeft, Plus, X } from 'lucide-react';

const JobCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
        benefits: filteredBenefits,
        status: 'active'
      };

      await jobService.createJob(jobData);
      setSuccess('Job posted successfully!');
      
      // Reset form
      reset();
      setRequirements(['']);
      setResponsibilities(['']);
      setSkillsRequired(['']);
      setBenefits(['']);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/app/jobs');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new job posting.</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className="input"
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div>
              <label className="form-label">Department *</label>
              <input
                type="text"
                {...register('department', { required: 'Department is required' })}
                className="input"
                placeholder="e.g., Engineering"
              />
              {errors.department && <p className="form-error">{errors.department.message}</p>}
            </div>

            <div>
              <label className="form-label">Location *</label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="input"
                placeholder="e.g., New York, NY"
              />
              {errors.location && <p className="form-error">{errors.location.message}</p>}
            </div>

            <div>
              <label className="form-label">Job Type *</label>
              <select
                {...register('job_type', { required: 'Job type is required' })}
                className="input"
              >
                <option value="">Select job type</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
              {errors.job_type && <p className="form-error">{errors.job_type.message}</p>}
            </div>

            <div>
              <label className="form-label">Experience Level *</label>
              <select
                {...register('experience_level', { required: 'Experience level is required' })}
                className="input"
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="manager">Manager</option>
              </select>
              {errors.experience_level && <p className="form-error">{errors.experience_level.message}</p>}
            </div>

            <div>
              <label className="form-label">Salary Range</label>
              <input
                type="text"
                {...register('salary_range')}
                className="input"
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Job Description</h2>
          <div>
            <label className="form-label">Description *</label>
            <textarea
              {...register('description', { 
                required: 'Job description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
              rows={6}
              className="input"
              placeholder="Provide a detailed description of the role, responsibilities, and what makes this position exciting..."
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Requirements</h2>
          <p className="text-gray-600 mb-4">List the key requirements and qualifications for this position.</p>
          {requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) => updateItem(requirements, setRequirements, index, e.target.value)}
                className="input flex-1"
                placeholder="e.g., Bachelor's degree in Computer Science or related field"
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(requirements, setRequirements, index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(requirements, setRequirements)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Requirement
          </button>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Responsibilities</h2>
          <p className="text-gray-600 mb-4">List the main responsibilities and duties for this role.</p>
          {responsibilities.map((responsibility, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => updateItem(responsibilities, setResponsibilities, index, e.target.value)}
                className="input flex-1"
                placeholder="e.g., Design and implement scalable software solutions"
              />
              {responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(responsibilities, setResponsibilities, index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(responsibilities, setResponsibilities)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Responsibility
          </button>
        </div>

        {/* Skills Required */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Skills Required</h2>
          <p className="text-gray-600 mb-4">List the technical skills and competencies needed for this position.</p>
          {skillsRequired.map((skill, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateItem(skillsRequired, setSkillsRequired, index, e.target.value)}
                className="input flex-1"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              {skillsRequired.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(skillsRequired, setSkillsRequired, index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(skillsRequired, setSkillsRequired)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Skill
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Benefits & Perks</h2>
          <p className="text-gray-600 mb-4">List the benefits and perks offered with this position.</p>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateItem(benefits, setBenefits, index, e.target.value)}
                className="input flex-1"
                placeholder="e.g., Health insurance, 401(k) matching, flexible work hours"
              />
              {benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(benefits, setBenefits)}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Benefit
          </button>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreate; 