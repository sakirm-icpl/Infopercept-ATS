import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import { applicationService } from '../services/applicationService';
import { userService } from '../services/userService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

const InterviewForm = () => {
  const { id, stage } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [stageData, setStageData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [stageNumber, setStageNumber] = useState(parseInt(stage) || 1);

  useEffect(() => {
    loadApplication();
    loadTeamMembers();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const appData = await applicationService.getApplicationById(id);
      setApplication(appData);
      
      // Load existing stage data if available
      if (appData.stages) {
        const stageField = getStageField(stageNumber);
        if (appData.stages[stageField]) {
          setStageData(appData.stages[stageField]);
        }
      }
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const members = await userService.getUsersByRole('team_member');
      setTeamMembers(members);
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };

  const getStageField = (stage) => {
    const fields = {
      1: 'stage1_hr_screening',
      2: 'stage2_practical_lab',
      3: 'stage3_technical_interview',
      4: 'stage4_hr_round',
      5: 'stage5_bu_lead_interview',
      6: 'stage6_ceo_interview',
      7: 'stage7_final_recommendation'
    };
    return fields[stage];
  };

  const getStageInfo = () => {
    return interviewService.getStageInfo(stageNumber);
  };

  const handleInputChange = (field, value) => {
    setStageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    try {
      switch (stageNumber) {
        case 1:
          interviewService.validateStage1Data(stageData);
          break;
        case 2:
          interviewService.validateStage2Data(stageData);
          break;
        case 3:
          interviewService.validateStage3Data(stageData);
          break;
        case 4:
          interviewService.validateStage4Data(stageData);
          break;
        case 5:
          interviewService.validateStage5Data(stageData);
          break;
        case 6:
          interviewService.validateStage6Data(stageData);
          break;
        case 7:
          interviewService.validateStage7Data(stageData);
          break;
        default:
          throw new Error('Invalid stage number');
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let result;
      switch (stageNumber) {
        case 1:
          result = await interviewService.submitStage1Feedback(id, stageData);
          break;
        case 2:
          result = await interviewService.submitStage2Feedback(id, stageData);
          break;
        case 3:
          result = await interviewService.submitStage3Feedback(id, stageData);
          break;
        case 4:
          result = await interviewService.submitStage4Feedback(id, stageData);
          break;
        case 5:
          result = await interviewService.submitStage5Feedback(id, stageData);
          break;
        case 6:
          result = await interviewService.submitStage6Feedback(id, stageData);
          break;
        case 7:
          result = await interviewService.submitStage7Feedback(id, stageData);
          break;
        default:
          throw new Error('Invalid stage number');
      }

      setSuccess('Interview feedback submitted successfully!');
      setApplication(result);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/app/my-assignments');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStage1Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <select
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Panel Member</option>
          <option value="Muskan">Muskan</option>
          <option value="Vidhi">Vidhi</option>
          <option value="Komal">Komal</option>
          <option value="Nikita">Nikita</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Feedback (2-3 lines) *
        </label>
        <textarea
          value={stageData.panel_feedback || ''}
          onChange={(e) => handleInputChange('panel_feedback', e.target.value)}
          rows={3}
          className="form-textarea w-full"
          placeholder="Provide detailed feedback about the candidate..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          MCQ Test Score (0-100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={stageData.mcq_test_score || ''}
          onChange={(e) => handleInputChange('mcq_test_score', parseInt(e.target.value) || null)}
          className="form-input w-full"
          placeholder="Enter test score"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Comments *
        </label>
        <textarea
          value={stageData.panel_comments || ''}
          onChange={(e) => handleInputChange('panel_comments', e.target.value)}
          rows={3}
          className="form-textarea w-full"
          placeholder="Additional comments and observations..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Communication Skills *
        </label>
        <select
          value={stageData.communication_skills || ''}
          onChange={(e) => handleInputChange('communication_skills', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Communication Level</option>
          <option value="Poor">Poor</option>
          <option value="Average">Average</option>
          <option value="Good">Good</option>
          <option value="Excellent">Excellent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.scale || ''}
          onChange={(e) => handleInputChange('scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Scale *
        </label>
        <textarea
          value={stageData.reason_for_scale || ''}
          onChange={(e) => handleInputChange('reason_for_scale', e.target.value)}
          rows={2}
          className="form-textarea w-full"
          placeholder="Explain the reasoning behind the scale rating..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <select
          value={stageData.outcome || ''}
          onChange={(e) => handleInputChange('outcome', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Outcome</option>
          <option value="Yes">Yes - Proceed to next stage</option>
          <option value="No">No - Do not proceed</option>
        </select>
      </div>
    </div>
  );

  const renderStage2Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <input
          type="text"
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-input w-full"
          placeholder="Enter panel member name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Completion Status *
        </label>
        <select
          value={stageData.completion_status || ''}
          onChange={(e) => handleInputChange('completion_status', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Status</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reviewer Comments *
        </label>
        <textarea
          value={stageData.reviewer_comments || ''}
          onChange={(e) => handleInputChange('reviewer_comments', e.target.value)}
          rows={4}
          className="form-textarea w-full"
          placeholder="Detailed comments about the practical test performance..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Result *
        </label>
        <select
          value={stageData.test_result || ''}
          onChange={(e) => handleInputChange('test_result', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Result</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
        </select>
      </div>
    </div>
  );

  const renderStage3Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <input
          type="text"
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-input w-full"
          placeholder="Enter panel member name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Feedback (6-7 lines) *
        </label>
        <textarea
          value={stageData.feedback || ''}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          rows={6}
          className="form-textarea w-full"
          placeholder="Comprehensive technical feedback..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.scale || ''}
          onChange={(e) => handleInputChange('scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Scale *
        </label>
        <textarea
          value={stageData.reason_for_scale || ''}
          onChange={(e) => handleInputChange('reason_for_scale', e.target.value)}
          rows={2}
          className="form-textarea w-full"
          placeholder="Explain the reasoning behind the scale rating..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <select
          value={stageData.outcome || ''}
          onChange={(e) => handleInputChange('outcome', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Outcome</option>
          <option value="Yes">Yes - Proceed to next stage</option>
          <option value="No">No - Do not proceed</option>
        </select>
      </div>
    </div>
  );

  const renderStage4Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <input
          type="text"
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-input w-full"
          placeholder="Enter panel member name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Feedback (6-7 lines) *
        </label>
        <textarea
          value={stageData.feedback || ''}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          rows={6}
          className="form-textarea w-full"
          placeholder="Comprehensive HR feedback..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.scale || ''}
          onChange={(e) => handleInputChange('scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Scale *
        </label>
        <textarea
          value={stageData.reason_for_scale || ''}
          onChange={(e) => handleInputChange('reason_for_scale', e.target.value)}
          rows={2}
          className="form-textarea w-full"
          placeholder="Explain the reasoning behind the scale rating..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <select
          value={stageData.outcome || ''}
          onChange={(e) => handleInputChange('outcome', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Outcome</option>
          <option value="Yes">Yes - Proceed to next stage</option>
          <option value="No">No - Do not proceed</option>
        </select>
      </div>

      {/* Rating Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Skills (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={stageData.communication_rating || ''}
            onChange={(e) => handleInputChange('communication_rating', parseInt(e.target.value))}
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cultural Fit (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={stageData.cultural_fit_rating || ''}
            onChange={(e) => handleInputChange('cultural_fit_rating', parseInt(e.target.value))}
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passion (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={stageData.passion_rating || ''}
            onChange={(e) => handleInputChange('passion_rating', parseInt(e.target.value))}
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leadership Potential (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={stageData.leadership_potential_rating || ''}
            onChange={(e) => handleInputChange('leadership_potential_rating', parseInt(e.target.value))}
            className="form-input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Agility (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={stageData.learning_agility_rating || ''}
            onChange={(e) => handleInputChange('learning_agility_rating', parseInt(e.target.value))}
            className="form-input w-full"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStage5Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <input
          type="text"
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-input w-full"
          placeholder="Enter BU Lead name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Feedback *
        </label>
        <textarea
          value={stageData.feedback || ''}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          rows={6}
          className="form-textarea w-full"
          placeholder="BU Lead feedback and assessment..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.scale || ''}
          onChange={(e) => handleInputChange('scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Scale *
        </label>
        <textarea
          value={stageData.reason_for_scale || ''}
          onChange={(e) => handleInputChange('reason_for_scale', e.target.value)}
          rows={2}
          className="form-textarea w-full"
          placeholder="Explain the reasoning behind the scale rating..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <select
          value={stageData.outcome || ''}
          onChange={(e) => handleInputChange('outcome', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Outcome</option>
          <option value="Yes">Yes - Proceed to next stage</option>
          <option value="No">No - Do not proceed</option>
        </select>
      </div>
    </div>
  );

  const renderStage6Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Name *
        </label>
        <input
          type="text"
          value={stageData.panel_name || ''}
          onChange={(e) => handleInputChange('panel_name', e.target.value)}
          className="form-input w-full"
          placeholder="Enter CEO name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Panel Feedback *
        </label>
        <textarea
          value={stageData.feedback || ''}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          rows={6}
          className="form-textarea w-full"
          placeholder="CEO feedback and final assessment..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.scale || ''}
          onChange={(e) => handleInputChange('scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Scale *
        </label>
        <textarea
          value={stageData.reason_for_scale || ''}
          onChange={(e) => handleInputChange('reason_for_scale', e.target.value)}
          rows={2}
          className="form-textarea w-full"
          placeholder="Explain the reasoning behind the scale rating..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outcome *
        </label>
        <select
          value={stageData.outcome || ''}
          onChange={(e) => handleInputChange('outcome', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Outcome</option>
          <option value="Yes">Yes - Proceed to final recommendation</option>
          <option value="No">No - Do not proceed</option>
        </select>
      </div>
    </div>
  );

  const renderStage7Form = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status *
        </label>
        <select
          value={stageData.status || ''}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className="form-select w-full"
          required
        >
          <option value="">Select Status</option>
          <option value="Select">Select - Offer Recommended</option>
          <option value="Hold">Hold - Further Consideration</option>
          <option value="Reject">Reject - Not Suitable</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cumulative Scale (1-10) *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={stageData.cumulative_scale || ''}
          onChange={(e) => handleInputChange('cumulative_scale', parseInt(e.target.value))}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Suggestions / Final Comments *
        </label>
        <textarea
          value={stageData.suggestions || ''}
          onChange={(e) => handleInputChange('suggestions', e.target.value)}
          rows={6}
          className="form-textarea w-full"
          placeholder="Provide final recommendations and comments..."
          required
        />
      </div>
    </div>
  );

  const renderForm = () => {
    switch (stageNumber) {
      case 1:
        return renderStage1Form();
      case 2:
        return renderStage2Form();
      case 3:
        return renderStage3Form();
      case 4:
        return renderStage4Form();
      case 5:
        return renderStage5Form();
      case 6:
        return renderStage6Form();
      case 7:
        return renderStage7Form();
      default:
        return <div>Invalid stage number</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <Button onClick={() => navigate('/app/my-assignments')}>
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const stageInfo = getStageInfo();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Feedback - Stage {stageNumber}
          </h1>
          <p className="text-gray-600">{stageInfo?.name}</p>
        </div>

        {/* Application Info */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidate Information</h3>
              <p><strong>Name:</strong> {application.name}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Mobile:</strong> {application.mobile}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Status</h3>
              <p><strong>Current Stage:</strong> {application.current_stage}</p>
              <p><strong>Status:</strong> <StatusBadge status={application.status} /></p>
              <p><strong>Applied:</strong> {new Date(application.date_of_application).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Progress</h3>
          <ProgressBar 
            current={application.current_stage} 
            total={7} 
            className="mb-4"
          />
        </div>

        {/* Notification Messages */}
        {error && (
          <Notification type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Notification type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Interview Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {stageInfo?.name}
              </h3>
              <p className="text-gray-600">{stageInfo?.description}</p>
            </div>

            {renderForm()}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/app/my-assignments')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </Card>
    </div>
  );
};

export default InterviewForm;