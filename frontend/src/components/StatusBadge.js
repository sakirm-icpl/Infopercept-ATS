import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'approved':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed'
        };
      case 'pending':
      case 'in_progress':
      case 'review':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pending'
        };
      case 'rejected':
      case 'failed':
      case 'declined':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejected'
        };
      case 'active':
        return {
          icon: AlertCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Active'
        };
      default:
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} font-semibold rounded-full border ${config.className}`}>
      <Icon className={`${iconSizes[size]} mr-1`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;