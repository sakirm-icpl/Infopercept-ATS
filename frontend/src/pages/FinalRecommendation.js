import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import { applicationService } from '../services/applicationService';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

const FinalRecommendation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [recommendation, setRecommendation] = useState({
    status: '',
    cumulative_scale: '',
    suggestions: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const appData = await applicationService.getApplicationById(id);
      setApplication(appData);
      
      // Load existing final recommendation if available
      if (appData.stages?.final_recommendation) {
        setRecommendation(appData.stages.final_recommendation);
      }
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRecommendation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    try {
      interviewService.validateFinalRecommendationData(recommendation);
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

      const result = await interviewService.submitFinalRecommendation(id, recommendation);
      
      setSuccess('Final recommendation submitted successfully!');
      setApplication(result);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/app/applications');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit final recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateCumulativeScale = () => {
    if (!application?.stages) return 0;
    
    const stages = application.stages;
    let totalScale = 0;
    let stageCount = 0;
    
    // Calculate average from all completed stages
    for (let i = 1; i <= 6; i++) {
      const stageField = `stage${i}_hr_screening`;
      const stageData = stages[stageField];
      
      if (stageData && stageData.scale) {
        totalScale += stageData.scale;
        stageCount++;
      }
    }
    
    return stageCount > 0 ? Math.round(totalScale / stageCount) : 0;
  };

  const getStageSummary = () => {
    if (!application?.stages) return [];
    
    const stages = application.stages;
    const summary = [];
    
    const stageNames = {
      1: 'HR Screening',
      2: 'Practical Lab Test',
      3: 'Technical Interview',
      4: 'HR Round',
      5: 'BU Lead Interview',
      6: 'CEO Interview'
    };
    
    for (let i = 1; i <= 6; i++) {
      const stageField = `stage${i}_hr_screening`;
      const stageData = stages[stageField];
      const status = stages[`stage${i}_status`] || 'pending';
      
      summary.push({
        stage: i,
        name: stageNames[i],
        status: status,
        scale: stageData?.scale || null,
        outcome: stageData?.outcome || null,
        panel: stageData?.panel_name || null
      });
    }
    
    return summary;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
            <Button onClick={() => navigate('/app/applications')}>
              Back to Applications
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const stageSummary = getStageSummary();
  const cumulativeScale = calculateCumulativeScale();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Final Recommendation
          </h1>
          <p className="text-gray-600">
            Review all interview stages and provide final decision
          </p>
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
            total={6} 
            className="mb-4"
          />
        </div>

        {/* Stage Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Stage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stageSummary.map((stage) => (
              <div key={stage.stage} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Stage {stage.stage}</h4>
                  <StatusBadge status={stage.status} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{stage.name}</p>
                {stage.panel && (
                  <p className="text-xs text-gray-500">Panel: {stage.panel}</p>
                )}
                {stage.scale && (
                  <p className="text-xs text-gray-500">Scale: {stage.scale}/10</p>
                )}
                {stage.outcome && (
                  <p className="text-xs text-gray-500">Outcome: {stage.outcome}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Notification Messages */}
        {error && (
          <Notification type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Notification type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Final Recommendation Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Final Recommendation
              </h3>
              <p className="text-gray-600">
                Based on all interview stages, provide the final decision and recommendations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Status *
              </label>
              <select
                value={recommendation.status || ''}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Final Status</option>
                <option value="Select">Select - Candidate is selected</option>
                <option value="Hold">Hold - Keep on hold for future consideration</option>
                <option value="Reject">Reject - Do not select the candidate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cumulative Scale (1-10) *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={recommendation.cumulative_scale || ''}
                  onChange={(e) => handleInputChange('cumulative_scale', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cumulative scale"
                  required
                />
                <div className="text-sm text-gray-500">
                  Calculated: {cumulativeScale}/10
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Overall rating based on all interview stages
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions (1-2 lines) *
              </label>
              <textarea
                value={recommendation.suggestions || ''}
                onChange={(e) => handleInputChange('suggestions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide final suggestions and recommendations..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/app/applications')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Final Recommendation'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default FinalRecommendation; 