import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Shield,
  Briefcase,
  Award,
  Activity,
  ArrowRight,
  Plus,
  Search,
  Eye,
  Target,
  Zap,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'candidate') {
        // Fetch candidate's applications
        const response = await apiClient.get('/api/applications/');
        const applications = response.data;
        
        const inProgress = applications.filter(app => app.status === 'in_progress').length;
        const completed = applications.filter(app => app.status === 'completed').length;
        const successRate = applications.length > 0 
          ? Math.round((completed / applications.length) * 100) 
          : 0;
        
        setStats({
          totalApplications: applications.length,
          inProgress,
          successRate
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'candidate':
        return {
          title: 'Your Career Journey',
          subtitle: 'Track your applications and interview progress',
          stats: [
            {
              title: 'Applications Submitted',
              value: stats?.totalApplications?.toString() || '0',
              icon: FileText,
              color: 'primary',
              change: stats?.totalApplications > 0 ? `${stats.totalApplications} application${stats.totalApplications !== 1 ? 's' : ''}` : 'Start your journey'
            },
            {
              title: 'In Progress',
              value: stats?.inProgress?.toString() || '0',
              icon: Clock,
              color: 'warning',
              change: stats?.inProgress > 0 ? `${stats.inProgress} active` : 'No interviews yet'
            },
            {
              title: 'Success Rate',
              value: `${stats?.successRate || 0}%`,
              icon: TrendingUp,
              color: 'success',
              change: stats?.totalApplications > 0 ? 'Keep going!' : 'Apply to get started'
            }
          ],
          quickActions: [
            {
              title: 'My Applications',
              description: 'Track your application status',
              icon: FileText,
              href: '/app/my-applications',
              color: 'primary'
            },
            {
              title: 'Browse Open Positions',
              description: 'Find new opportunities',
              icon: Search,
              href: '/app/jobs',
              color: 'secondary'
            }
          ],
          recentActivity: []
        };

      case 'hr':
        return {
          title: 'HR Dashboard',
          subtitle: 'Manage applications and find the best talent',
          stats: [
            {
              title: 'Total Applications',
              value: '0',
              icon: FileText,
              color: 'primary',
              change: 'No applications yet'
            },
            {
              title: 'In Progress',
              value: '0',
              icon: Clock,
              color: 'warning',
              change: 'No pending reviews'
            },
            {
              title: 'Success Rate',
              value: '0%',
              icon: TrendingUp,
              color: 'success',
              change: 'Start hiring to see metrics'
            }
          ],
          quickActions: [
            {
              title: 'Create Job Posting',
              description: 'Add new positions',
              icon: Plus,
              href: '/app/jobs/create',
              color: 'success'
            },
            {
              title: 'Review Applications',
              description: 'Evaluate candidates',
              icon: FileText,
              href: '/app/applications',
              color: 'primary'
            }
          ],
          recentActivity: []
        };

      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'Oversee the entire recruitment process',
          stats: [
            {
              title: 'Total Users',
              value: '1',
              icon: Users,
              color: 'primary',
              change: 'You are the first user'
            },
            {
              title: 'Active Jobs',
              value: '0',
              icon: Briefcase,
              color: 'warning',
              change: 'Create your first job posting'
            },
            {
              title: 'System Health',
              value: '100%',
              icon: Shield,
              color: 'success',
              change: 'All systems operational'
            }
          ],
          quickActions: [
            {
              title: 'User Management',
              description: 'Manage team members and roles',
              icon: Users,
              href: '/app/users',
              color: 'primary'
            },
            {
              title: 'Create Job Posting',
              description: 'Add new positions',
              icon: Plus,
              href: '/app/jobs/create',
              color: 'success'
            }
          ],
          recentActivity: []
        };

      case 'team_member':
        return {
          title: 'Interview Dashboard',
          subtitle: 'Manage your assigned interviews and feedback',
          stats: [
            {
              title: 'My Assignments',
              value: '0',
              icon: Briefcase,
              color: 'primary',
              change: 'No assignments yet'
            },
            {
              title: 'Completed Today',
              value: '0',
              icon: CheckCircle,
              color: 'success',
              change: 'No interviews completed'
            },
            {
              title: 'Average Rating',
              value: '0/5',
              icon: Award,
              color: 'warning',
              change: 'Start interviewing to get rated'
            }
          ],
          quickActions: [
            {
              title: 'View All Applications',
              description: 'Browse all active applications',
              icon: FileText,
              href: '/app/applications',
              color: 'secondary'
            },
            {
              title: 'My Pending Interviews',
              description: 'Access your assigned interviews',
              icon: ClipboardList,
              href: '/app/my-assignments',
              color: 'success'
            }
          ],
          recentActivity: []
        };

      default:
        return {
          title: 'Welcome to your dashboard',
          subtitle: 'Welcome to your dashboard',
          stats: [],
          quickActions: [],
          recentActivity: []
        };
    }
  };

  const content = getRoleSpecificContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
          <p className="text-gray-600">{content.subtitle}</p>
        </div>
        <div className="hidden md:block">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'text-blue-600 bg-blue-50',
            success: 'text-green-600 bg-green-50',
            warning: 'text-yellow-600 bg-yellow-50',
            info: 'text-blue-600 bg-blue-50'
          };
          return (
            <Card key={index} className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {content.quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              primary: 'bg-blue-50 text-blue-600',
              secondary: 'bg-gray-50 text-gray-600',
              success: 'bg-green-50 text-green-600'
            };
            return (
              <Link
                key={index}
                to={action.href}
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`p-2 rounded-lg ${colorClasses[action.color]} mr-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link to="/app/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {content.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
              <p className="text-gray-500 text-sm">
                {user?.role === 'candidate' && 'Start by applying to job positions'}
                {user?.role === 'hr' && 'Create job postings to see applications'}
                {user?.role === 'team_member' && 'Wait for interview assignments'}
                {user?.role === 'admin' && 'Set up your recruitment process'}
              </p>
            </div>
          ) : (
            content.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">
                      {activity.title?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={activity.status} size="sm" />
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Getting Started Section */}
      {user?.role === 'admin' && (
        <Card>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Infopercept ATS</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              You're all set up! Start building your recruitment process by creating job postings, 
              inviting team members, and managing applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/app/jobs/create"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Job
              </Link>
              <Link
                to="/app/users"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Invite Team Members
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">System Status: Operational</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <Zap className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard; 