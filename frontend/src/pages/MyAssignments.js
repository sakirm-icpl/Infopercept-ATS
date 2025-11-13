import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Notification from '../components/Notification';

const MyAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed

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
    return assignments.filter(assignment => assignment.status === filter);
  };

  const getStats = () => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending' || a.status === 'assigned').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const forwarded = assignments.filter(a => a.status === 'forwarded').length;
    
    return { total, pending, completed, forwarded };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const filteredAssignments = getFilteredAssignments();
  const stats = getStats();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Interview Assignments
              </h1>
              <p className="text-gray-600">
                Manage your assigned interview stages and provide feedback
              </p>
            </div>
            <Button onClick={handleRefresh} variant="secondary">
              Refresh
            </Button>
          </div>
        </div>

        {/* Notification */}
        {error && (
          <Notification type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.forwarded}
              </div>
              <div className="text-sm text-gray-600">Forwarded</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Filter Assignments</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All Assignments
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No Assignments Found' : `No ${filter} Assignments`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'You have no interview assignments at this time.'
                  : `You have no ${filter} interview assignments.`}
              </p>
              <Button onClick={handleRefresh} variant="secondary">
                Refresh Assignments
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.application?.name || 'Unknown Candidate'}
                      </h3>
                      <StatusBadge status={assignment.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Position</p>
                        <p>{assignment.job?.title || 'Unknown Position'}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Department</p>
                        <p>{assignment.job?.department || 'Unknown Department'}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Interview Stage</p>
                        <p>Stage {assignment.stage_number}: {getStageName(assignment.stage_number)}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Assigned Date</p>
                        <p>{assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : 'Unknown Date'}</p>
                      </div>
                    </div>
                    
                    {assignment.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Notes:</span> {assignment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {assignment.status === 'assigned' && (
                      <Link
                        to={`/app/applications/${assignment.application_id}/interview/${assignment.stage_number}`}
                        className="btn-primary whitespace-nowrap"
                      >
                        Conduct Interview
                      </Link>
                    )}
                    
                    {assignment.status === 'completed' && (
                      <Link
                        to={`/app/applications/${assignment.application_id}/interview/${assignment.stage_number}`}
                        className="btn-secondary whitespace-nowrap"
                      >
                        View Feedback
                      </Link>
                    )}
                    
                    <Link
                      to={`/app/applications/${assignment.application_id}`}
                      className="btn-outline whitespace-nowrap"
                    >
                      View Application
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyAssignments;