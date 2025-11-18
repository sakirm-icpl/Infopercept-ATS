import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Search, Filter, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && (
    (typeof currentUser.role === 'string' && currentUser.role.toLowerCase() === 'admin') ||
    (currentUser.role && typeof currentUser.role === 'object' && (currentUser.role.value || '').toLowerCase() === 'admin')
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    role: 'candidate',
    password: '',
    confirmPassword: ''
  });
  
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    role: 'candidate',
    password: '',
    confirmPassword: ''
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'team_member', label: 'Team Member' },
    { value: 'requester', label: 'Requester' },
    { value: 'ceo', label: 'CEO' },
    { value: 'candidate', label: 'Candidate' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setCreatingUser(true);
      setError('');
      
      const userData = {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        password: formData.password
      };
      
      await userService.createUser(userData);
      
      setSuccessMessage('User created successfully!');
      setShowCreateForm(false);
      clearForm();
      loadUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      // Prepare payload: only send password if provided and valid
      const payload = {
        username: editFormData.username,
        email: editFormData.email,
        mobile: editFormData.mobile,
        role: editFormData.role
      };

      if (editFormData.password && editFormData.password.length > 0) {
        if (editFormData.password !== editFormData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (editFormData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        payload.password = editFormData.password;
      }

      await userService.updateUser(editingUser.id, payload);
      
      setSuccessMessage('User updated successfully!');
      setEditingUser(null);
      loadUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setSuccessMessage('User deleted successfully!');
        loadUsers();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const clearForm = () => {
    setFormData({
      username: '',
      email: '',
      mobile: '',
      role: 'candidate',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccessMessage('');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', label: 'Admin' },
      hr: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'HR' },
      team_member: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Team Member' },
      requester: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Requester' },
      ceo: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'CEO' },
      candidate: { bg: 'bg-green-100', text: 'text-green-800', label: 'Candidate' },
    };
    
    const config = roleConfig[role] || roleConfig.candidate;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their roles</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by username or email..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="form-select pl-10 w-full"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>
          
          <div className="overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                    {editingUser && editingUser.id === user.id ? (
                      // Edit Form
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Username *
                            </label>
                            <input
                              type="text"
                              name="username"
                              className="form-input w-full"
                              value={editFormData.username}
                              onChange={handleEditFormChange}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              className="form-input w-full"
                              value={editFormData.email}
                              onChange={handleEditFormChange}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mobile *
                            </label>
                            <input
                              type="text"
                              name="mobile"
                              className="form-input w-full"
                              value={editFormData.mobile}
                              onChange={handleEditFormChange}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role *
                            </label>
                            <select
                              name="role"
                              className="form-select w-full"
                              value={editFormData.role}
                              onChange={handleEditFormChange}
                              required
                            >
                              <option value="">Select Role</option>
                              {roleOptions.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {isAdmin && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Password
                                </label>
                                <input
                                  type="password"
                                  name="password"
                                  className="form-input w-full"
                                  value={editFormData.password}
                                  onChange={handleEditFormChange}
                                  placeholder="Leave blank to keep existing password"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirm Password
                                </label>
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  className="form-input w-full"
                                  value={editFormData.confirmPassword}
                                  onChange={handleEditFormChange}
                                  placeholder="Confirm new password"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 pt-4">
                          <button
                            type="submit"
                            className="btn-primary"
                          >
                            Update User
                          </button>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      // User Display
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {user.username}
                              </h3>
                              {getRoleBadge(user.role)}
                              {getStatusBadge(user.is_active)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {user.email} • {user.mobile}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditing(user)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create New User
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-input w-full"
                      value={formData.username}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-input w-full"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile *
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-input w-full"
                      value={formData.mobile}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      className="form-select w-full"
                      value={formData.role}
                      onChange={handleFormChange}
                      required
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-input w-full"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input w-full"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={creatingUser}
                    >
                      {creatingUser ? 'Creating...' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        clearForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Role Permissions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Admin:</strong> Full system access, user management, can create all other users</li>
                    <li><strong>HR Manager:</strong> Can manage applications, assign interviews, approve/reject feedback</li>
                    <li><strong>Team Member:</strong> Can conduct assigned interviews and submit feedback</li>
                    <li><strong>CEO:</strong> View all applications, feedback, and analytics for executive oversight</li>
                    <li><strong>Requester:</strong> Can initiate job requests and participate in interviews</li>
                    <li><strong>Candidate:</strong> Can apply for jobs and track application status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default UserManagement;