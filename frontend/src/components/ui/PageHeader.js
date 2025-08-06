import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;