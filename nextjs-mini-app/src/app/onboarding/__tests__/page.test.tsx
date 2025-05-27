import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers
import OnboardingPage from '../page'; // Adjust path as necessary

// Mock child components to simplify testing the page logic
// We are interested in the page's behavior, not the individual components' internal workings here.
jest.mock('@/components/onboarding/ContextualQuestions', () => ({ formData, setFormData }: any) => (
  <div data-testid="contextual-questions">
    <input
      data-testid="conflictDescription"
      value={formData.conflictDescription}
      onChange={(e) => setFormData({ ...formData, conflictDescription: e.target.value })}
    />
  </div>
));
jest.mock('@/components/onboarding/MediatorSelection', () => ({ selectedMediator, setSelectedMediator }: any) => (
  <div data-testid="mediator-selection">
    <input
      data-testid="selectedMediator"
      value={selectedMediator}
      onChange={(e) => setSelectedMediator(e.target.value)}
    />
  </div>
));
jest.mock('@/components/onboarding/GoalSetting', () => ({ formData, setFormData }: any) => (
  <div data-testid="goal-setting">
    <input
      data-testid="desiredOutcome"
      value={formData.desiredOutcome}
      onChange={(e) => setFormData({ ...formData, desiredOutcome: e.target.value })}
    />
  </div>
));

describe('OnboardingPage', () => {
  // Mock global.fetch
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch; // Restore original fetch
  });

  it('renders all three child components', () => {
    render(<OnboardingPage />);
    expect(screen.getByTestId('contextual-questions')).toBeInTheDocument();
    expect(screen.getByTestId('mediator-selection')).toBeInTheDocument();
    expect(screen.getByTestId('goal-setting')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Onboarding Data/i })).toBeInTheDocument();
  });

  it('submits data and handles successful API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ guidance: 'Test guidance received!' }),
    });

    render(<OnboardingPage />);

    // Simulate user input using the simplified mock components
    fireEvent.change(screen.getByTestId('conflictDescription'), { target: { value: 'My conflict' } });
    fireEvent.change(screen.getByTestId('selectedMediator'), { target: { value: 'neutral' } });
    fireEvent.change(screen.getByTestId('desiredOutcome'), { target: { value: 'My goal' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Data/i });
    fireEvent.click(submitButton);

    // Check for loading state (button text changes)
    expect(screen.getByRole('button', { name: /Submitting.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_data: {
            conflictDescription: 'My conflict',
            partiesInvolved: '', // From initial state as mocks don't fill everything
            relationshipWithParties: '', // From initial state
            attemptsMade: '', // From initial state
            mediatorPreference: 'neutral',
            desiredOutcome: 'My goal',
            willingToCompromise: '', // From initial state
            idealResolutionTimeframe: '', // From initial state
          },
        }),
      });
    });

    // Check for success message and guidance
    await waitFor(() => {
      expect(screen.getByText('Test guidance received!')).toBeInTheDocument();
    });
    // Button should revert to original text
    expect(screen.getByRole('button', { name: /Submit Onboarding Data/i })).toBeInTheDocument();
  });

  it('handles API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ details: 'Server error occurred' }),
    });

    render(<OnboardingPage />);
    
    fireEvent.change(screen.getByTestId('conflictDescription'), { target: { value: 'Error test' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Data/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /Submitting.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Error: Server error occurred/i)).toBeInTheDocument();
    });
     // Button should revert to original text
    expect(screen.getByRole('button', { name: /Submit Onboarding Data/i })).toBeInTheDocument();
  });

  it('handles network error during fetch', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network failed'));

    render(<OnboardingPage />);
    
    const submitButton = screen.getByRole('button', { name: /Submit Onboarding Data/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /Submitting.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Error: Network failed/i)).toBeInTheDocument();
    });
     // Button should revert to original text
    expect(screen.getByRole('button', { name: /Submit Onboarding Data/i })).toBeInTheDocument();
  });
});
