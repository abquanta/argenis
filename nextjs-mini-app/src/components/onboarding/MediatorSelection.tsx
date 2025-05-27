'use client';

import React from 'react';

interface MediatorSelectionProps {
  selectedMediator: string;
  setSelectedMediator: (mediator: string) => void;
}

const mediatorTypes = [
  { id: 'neutral', label: 'Neutral', description: 'Focuses on fairness and impartiality.' },
  { id: 'empathetic', label: 'Empathetic', description: 'Prioritizes understanding feelings and perspectives.' },
  { id: 'direct', label: 'Direct', description: 'Offers more straightforward guidance and suggestions.' },
];

const MediatorSelection: React.FC<MediatorSelectionProps> = ({ selectedMediator, setSelectedMediator }) => {
  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Choose Your Mediator Style</h2>
      <div className="space-y-4">
        {mediatorTypes.map((type) => (
          <label
            key={type.id}
            htmlFor={type.id}
            className={`flex items-center p-4 border rounded-md cursor-pointer transition-all ${
              selectedMediator === type.id ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              id={type.id}
              name="mediatorType"
              value={type.id}
              checked={selectedMediator === type.id}
              onChange={(e) => setSelectedMediator(e.target.value)}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <div className="ml-3 text-sm">
              <span className="font-medium text-gray-900">{type.label}</span>
              <p className="text-gray-500 text-xs">{type.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MediatorSelection;
