'use client';

import React from 'react';

interface ContextualQuestionsProps {
  formData: {
    conflictDescription: string;
    partiesInvolved: string;
    relationshipWithParties: string;
    attemptsMade: string;
  };
  setFormData: (data: ContextualQuestionsProps['formData']) => void;
}

const ContextualQuestions: React.FC<ContextualQuestionsProps> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Contextual Questions</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="conflictDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Briefly describe the conflict:
          </label>
          <textarea
            id="conflictDescription"
            name="conflictDescription"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.conflictDescription}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="partiesInvolved" className="block text-sm font-medium text-gray-700 mb-1">
            Who is involved? (e.g., names, roles)
          </label>
          <input
            type="text"
            id="partiesInvolved"
            name="partiesInvolved"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.partiesInvolved}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="relationshipWithParties" className="block text-sm font-medium text-gray-700 mb-1">
            What is your relationship with the other party/parties?
          </label>
          <input
            type="text"
            id="relationshipWithParties"
            name="relationshipWithParties"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.relationshipWithParties}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="attemptsMade" className="block text-sm font-medium text-gray-700 mb-1">
            What have you tried so far to resolve the conflict?
          </label>
          <textarea
            id="attemptsMade"
            name="attemptsMade"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.attemptsMade}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ContextualQuestions;
