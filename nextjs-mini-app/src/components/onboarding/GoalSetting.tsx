'use client';

import React from 'react';

interface GoalSettingProps {
  formData: {
    desiredOutcome: string;
    willingToCompromise: string;
    idealResolutionTimeframe: string;
  };
  setFormData: (data: GoalSettingProps['formData']) => void;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Define Your Goals</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="desiredOutcome" className="block text-sm font-medium text-gray-700 mb-1">
            What would a successful resolution look like for you?
          </label>
          <textarea
            id="desiredOutcome"
            name="desiredOutcome"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.desiredOutcome}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="willingToCompromise" className="block text-sm font-medium text-gray-700 mb-1">
            What are you willing to compromise on?
          </label>
          <textarea
            id="willingToCompromise"
            name="willingToCompromise"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.willingToCompromise}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="idealResolutionTimeframe" className="block text-sm font-medium text-gray-700 mb-1">
            What is your ideal timeframe for resolving this?
          </label>
          <input
            type="text"
            id="idealResolutionTimeframe"
            name="idealResolutionTimeframe"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.idealResolutionTimeframe}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;
