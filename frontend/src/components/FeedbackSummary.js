import { CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * FeedbackSummary Component
 * Displays a summary of feedback across all stages for an application
 * Shows approved vs rejected count, average performance rating, and highlights rejected stages
 */
const FeedbackSummary = ({ application }) => {
  // Calculate feedback statistics
  const calculateFeedbackStats = () => {
    if (!application?.stages) {
      return {
        totalFeedback: 0,
        approvedCount: 0,
        rejectedCount: 0,
        averageRating: 0,
        rejectedStages: []
      };
    }

    let totalFeedback = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalRating = 0;
    const rejectedStages = [];

    // Iterate through all 7 stages
    for (let i = 1; i <= 7; i++) {
      const feedbackField = `stage${i}_feedback`;
      const feedback = application.stages[feedbackField];

      if (feedback) {
        totalFeedback++;
        totalRating += feedback.performance_rating;

        if (feedback.approval_status === 'Approved') {
          approvedCount++;
        } else if (feedback.approval_status === 'Rejected') {
          rejectedCount++;
          rejectedStages.push({
            stageNumber: i,
            stageName: getStageName(i),
            rating: feedback.performance_rating,
            comments: feedback.comments
          });
        }
      }
    }

    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(1) : 0;

    return {
      totalFeedback,
      approvedCount,
      rejectedCount,
      averageRating,
      rejectedStages
    };
  };

  const getStageName = (stageNumber) => {
    const stages = {
      1: 'HR Screening',
      2: 'Practical Lab Test',
      3: 'Technical Interview',
      4: 'HR Round',
      5: 'BU Lead Interview',
      6: 'CEO Interview',
      7: 'Final Recommendation & Offer'
    };
    return stages[stageNumber] || `Stage ${stageNumber}`;
  };

  const stats = calculateFeedbackStats();

  // Don't render if no feedback exists
  if (stats.totalFeedback === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Summary</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Approved Count */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved Stages</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{stats.approvedCount}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        {/* Rejected Count */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected Stages</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{stats.rejectedCount}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Average Rating</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {stats.averageRating}
                <span className="text-lg text-blue-500">/10</span>
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Rejected Stages Details */}
      {stats.rejectedStages.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h4 className="text-md font-medium text-red-700">Rejected Stages</h4>
          </div>
          <div className="space-y-3">
            {stats.rejectedStages.map((stage) => (
              <div
                key={stage.stageNumber}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-red-900">
                      Stage {stage.stageNumber}: {stage.stageName}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Rating: {stage.rating}/10
                    </p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Rejected
                  </span>
                </div>
                {stage.comments && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Comments:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{stage.comments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Assessment */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Total Feedback Received: <span className="font-medium text-gray-900">{stats.totalFeedback} of 7 stages</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Approval Rate: <span className="font-medium text-gray-900">
                {stats.totalFeedback > 0 ? Math.round((stats.approvedCount / stats.totalFeedback) * 100) : 0}%
              </span>
            </p>
          </div>
          {stats.averageRating >= 7 && stats.rejectedCount === 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Strong Candidate</span>
            </div>
          )}
          {stats.rejectedCount > 0 && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Needs Review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummary;
