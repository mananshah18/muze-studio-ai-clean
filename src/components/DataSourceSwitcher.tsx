import React from 'react';

interface DataSourceSwitcherProps {
  useThoughtSpotData: boolean;
  onToggle: (useThoughtSpotData: boolean) => void;
}

const DataSourceSwitcher: React.FC<DataSourceSwitcherProps> = ({ 
  useThoughtSpotData, 
  onToggle 
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Data Source:
      </span>
      <div className="relative inline-block w-10 mr-2 align-middle select-none">
        <input
          type="checkbox"
          id="toggle"
          checked={useThoughtSpotData}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
        />
        <label
          htmlFor="toggle"
          className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
            useThoughtSpotData ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
              useThoughtSpotData ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </label>
      </div>
      <span className={`text-sm font-medium ${
        useThoughtSpotData 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {useThoughtSpotData ? 'ThoughtSpot Data' : 'Sample Data'}
      </span>
    </div>
  );
};

export default DataSourceSwitcher; 