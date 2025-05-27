'use client';

import React, { useState } from 'react';
import ContextualQuestions from '@/components/onboarding/ContextualQuestions';
import MediatorSelection from '@/components/onboarding/MediatorSelection';
import GoalSetting from '@/components/onboarding/GoalSetting';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function OnboardingPage() {
  const [contextualData, setContextualData] = useState({
    conflictDescription: '',
    partiesInvolved: '',
    relationshipWithParties: '',
    attemptsMade: '',
  });
  const [selectedMediator, setSelectedMediator] = useState('');
  const [goalData, setGoalData] = useState({
    desiredOutcome: '',
    willingToCompromise: '',
    idealResolutionTimeframe: '',
  });

  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmissionStatus('loading');
    setApiResponse(null);

    const fullOnboardingData = {
      ...contextualData,
      mediatorPreference: selectedMediator,
      ...goalData,
    };

    const payload = {
      onboarding_data: fullOnboardingData,
    };

    try {
      const response = await fetch('http://localhost:5001/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: 'Failed to parse error response.' }));
        throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setApiResponse(result.guidance || 'Successfully submitted! No specific guidance received.');
      setSubmissionStatus('success');
      // Optionally, reset forms here or navigate away
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error("Error submitting onboarding data:", errorMessage);
      setApiResponse(`Error: ${errorMessage}`);
      setSubmissionStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-center text-gray-900">
            Onboarding
          </h1>
          <p className="mt-2 text-sm text-center text-gray-600">
            Please fill out the sections below to help us understand your situation.
          </p>
        </header>
        
        <div className="space-y-10">
          <ContextualQuestions formData={contextualData} setFormData={setContextualData} />
          <MediatorSelection selectedMediator={selectedMediator} setSelectedMediator={setSelectedMediator} />
          <GoalSetting formData={goalData} setFormData={setGoalData} />
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleSubmit}
            disabled={submissionStatus === 'loading'}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submissionStatus === 'loading' ? 'Submitting...' : 'Submit Onboarding Data'}
          </button>
        </div>

        {apiResponse && (
          <div className={`mt-6 p-4 rounded-md text-sm ${
              submissionStatus === 'success' ? 'bg-green-100 text-green-700' : ''
            } ${
              submissionStatus === 'error' ? 'bg-red-100 text-red-700' : ''
            }`}
          >
            {apiResponse}
          </div>
        )}
      </div>
    </div>
  );
}
