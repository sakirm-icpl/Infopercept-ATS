import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Notification from '../components/Notification';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const MyAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await interviewService.getMyAssignments();
      setAssignments(data);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAssignments();
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

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;
    if (filter === 'assigned') {
      return assignments.filter(a => {
        const status = a.status?.toLowerCase();
        return status === 'assigned' || status === 'in_progress' || status === 'pending';
      });
    }
    return assignments.filter(assignment => assignment.status?.toLowerCase() === filter.toLowerCase());
  };

  const getStats = () => {
    const total = assignments.length;
    const pending = assignments.filter(a => {
      const status = a.status?.toLowerCase();
      return status === 'assigned' || status === 'in_progress' || status === 'pending';
    }).length;
    const completed = assignments.filter(a => a.status?.toLowerCase() === 'completed').length;
    const forwarded = assignments.filter(a => a.status?.toLowerCase() === 'forwarded').length;
    
    return { total, pending, completed, forwarded };
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const isApproachingDeadline = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    if (isOverdue(deadline)) {
      return { type: 'overdue', icon: AlertCircle, className: 'text-red-600', label: 'Overdue' };
    }
    if (isApproachingDeadline(deadline)) {
      return { type: 'warning', icon: Clock, className: 'text-yellow-600', label: 'Due Soon' };
    }
    return { type: 'normal', icon: CheckCircle, className: 'text-green-600', label: 'On Track' };
  };
  
  // Swipe gesture handlers for mobile filter switching
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left - next filter
      if (filter === 'all') setFilter('assigned');
      else if (filter === 'assigned') setFilter('completed');
    }
    
    if (isRightSwipe) {
      // Swipe right - previous filter
      if (filter === 'completed') setFilter('assigned');
      else if (filter === 'assigned') setFilter('all');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Interview Assignments
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your assigned interview stages and provide feedback
              </p>
            </div>
            <Button onClick={handleRefresh} variant="secondary" className="w-full sm:w-auto min-h-[48px]">
              Refresh
            </Button>
          </div>
        </div>

        {/* Notification */}
        {error && (
          <Notification type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats.forwarded}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Forwarded</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div 
          className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Filter Assignments</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('assigned')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                  filter === 'assigned'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Assigned ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                  filter === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 sm:hidden">
            💡 Swipe left or right to switch filters
          </p>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-5xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No Assignments Found' : `No ${filter} Assignments`}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {filter === 'all'
                  ? 'You have no interview assignments at this time.'
                  : `You have no ${filter} interview assignments.`}
              </p>
              <Button onClick={handleRefresh} variant="secondary" className="w-full sm:w-auto min-h-[48px]">
                Refresh Assignments
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredAssignments.map((assignment) => {
              const deadlineStatus = getDeadlineStatus(assignment.deadline);
              const DeadlineIcon = deadlineStatus?.icon;
              
              return (
                <Card key={assignment.id} className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {assignment.application?.name || 'Unknown Candidate'}
                        </h3>
                        <StatusBadge status={assignment.status} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p className="font-medium text-gray-700 text-xs sm:text-sm">Position</p>
                          <p className="text-sm">{assignment.job?.title || 'Unknown Position'}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 text-xs sm:text-sm">Department</p>
                          <p className="text-sm">{assignment.job?.department || 'Unknown Department'}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 text-xs sm:text-sm">Interview Stage</p>
                          <p className="text-sm">Stage {assignment.stage_number}: {getStageName(assignment.stage_number)}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 text-xs sm:text-sm">Assigned Date</p>
                          <p className="text-sm">{assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : 'Unknown Date'}</p>
                        </div>
                      </div>
                      
                      {/* Deadline Warning */}
                      {assignment.deadline && deadlineStatus && (
                        <div className={`mb-3 p-3 rounded-lg border ${
                          deadlineStatus.type === 'overdue' 
                            ? 'bg-red-50 border-red-200' 
                            : deadlineStatus.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <DeadlineIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${deadlineStatus.className}`} />
                            <div className="flex-1">
                              <p className={`text-xs sm:text-sm font-medium ${deadlineStatus.className}`}>
                                {deadlineStatus.label}
                              </p>
                              <p className="text-xs text-gray-600">
                                Deadline: {new Date(assignment.deadline).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {assignment.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm text-blue-800">
                            <span className="font-medium">Notes:</span> {assignment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      {(['assigned', 'in_progress', 'pending'].includes(assignment.status?.toLowerCase())) && (
                        <Link
                          to={`/app/applications/${assignment.application_id}/feedback/${assignment.stage_number}`}
                          className="btn-primary whitespace-nowrap text-center min-h-[48px] flex items-center justify-center"
                        >
                          {user?.role === 'hr' ? 'Provide Feedback' : 'Start Interview'}
                        </Link>
                      )}
                      
                      {assignment.status?.toLowerCase() === 'completed' && (
                        <Link
                          to={`/app/applications/${assignment.application_id}/feedback/${assignment.stage_number}`}
                          className="btn-secondary whitespace-nowrap text-center min-h-[48px] flex items-center justify-center"
                        >
                          View Feedback
                        </Link>
                      )}
                      
                      <Link
                        to={`/app/applications/${assignment.application_id}`}
                        className="btn-outline whitespace-nowrap text-center min-h-[48px] flex items-center justify-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default MyAssignments;