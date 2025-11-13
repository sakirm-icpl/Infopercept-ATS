import React from 'react';
import { FileText, Users, Briefcase, Search } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  onAction,
  icon: CustomIcon 
}) => {
  const getDefaultConfig = (type) => {
    switch (type) {
      case 'applications':
        return {
          icon: FileText,
          title: 'No Applications Found',
          description: 'There are no applications to display at the moment.',
          actionText: 'Refresh'
        };
      case 'jobs':
        return {
          icon: Briefcase,
          title: 'No Jobs Available',
          description: 'There are currently no job openings posted.',
          actionText: 'Post New Job'
        };
      case 'users':
        return {
          icon: Users,
          title: 'No Users Found',
          description: 'No users match your current criteria.',
          actionText: 'Add User'
        };
      case 'search':
        return {
          icon: Search,
          title: 'No Results Found',
          description: 'Try adjusting your search criteria.',
          actionText: 'Clear Filters'
        };
      default:
        return {
          icon: FileText,
          title: 'No Data Available',
          description: 'There is no data to display at the moment.',
          actionText: 'Refresh'
        };
    }
  };

  const config = getDefaultConfig(type);
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionText = actionText || config.actionText;

  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {displayDescription}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center"
        >
          {displayActionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;