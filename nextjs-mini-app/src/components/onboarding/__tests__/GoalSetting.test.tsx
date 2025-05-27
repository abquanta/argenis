import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoalSetting from '../GoalSetting'; // Adjust path as necessary

describe('GoalSetting Component', () => {
  const mockSetFormData = jest.fn();
  const initialFormData = {
    desiredOutcome: '',
    willingToCompromise: '',
    idealResolutionTimeframe: '',
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it('renders all input fields and textareas', () => {
    render(<GoalSetting formData={initialFormData} setFormData={mockSetFormData} />);
    
    expect(screen.getByLabelText(/What would a successful resolution look like for you?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/What are you willing to compromise on?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/What is your ideal timeframe for resolving this?/i)).toBeInTheDocument();
  });

  it('calls setFormData with updated value for desiredOutcome', () => {
    render(<GoalSetting formData={initialFormData} setFormData={mockSetFormData} />);
    const textarea = screen.getByLabelText(/What would a successful resolution look like for you?/i);
    fireEvent.change(textarea, { target: { value: 'A peaceful agreement' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      desiredOutcome: 'A peaceful agreement',
    });
  });

  it('calls setFormData with updated value for willingToCompromise', () => {
    render(<GoalSetting formData={initialFormData} setFormData={mockSetFormData} />);
    const textarea = screen.getByLabelText(/What are you willing to compromise on?/i);
    fireEvent.change(textarea, { target: { value: 'The exact timing' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      willingToCompromise: 'The exact timing',
    });
  });

  it('calls setFormData with updated value for idealResolutionTimeframe', () => {
    render(<GoalSetting formData={initialFormData} setFormData={mockSetFormData} />);
    const input = screen.getByLabelText(/What is your ideal timeframe for resolving this?/i);
    fireEvent.change(input, { target: { value: 'Next month' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      idealResolutionTimeframe: 'Next month',
    });
  });

  it('displays the current formData values in the fields', () => {
    const filledFormData = {
      desiredOutcome: 'Test outcome',
      willingToCompromise: 'Test compromise',
      idealResolutionTimeframe: 'Test timeframe',
    };
    render(<GoalSetting formData={filledFormData} setFormData={mockSetFormData} />);

    expect(screen.getByLabelText(/What would a successful resolution look like for you?/i)).toHaveValue(filledFormData.desiredOutcome);
    expect(screen.getByLabelText(/What are you willing to compromise on?/i)).toHaveValue(filledFormData.willingToCompromise);
    expect(screen.getByLabelText(/What is your ideal timeframe for resolving this?/i)).toHaveValue(filledFormData.idealResolutionTimeframe);
  });
});
