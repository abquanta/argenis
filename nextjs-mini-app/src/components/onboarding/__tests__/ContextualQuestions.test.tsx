import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextualQuestions from '../ContextualQuestions'; // Adjust path as necessary

describe('ContextualQuestions Component', () => {
  const mockSetFormData = jest.fn();
  const initialFormData = {
    conflictDescription: '',
    partiesInvolved: '',
    relationshipWithParties: '',
    attemptsMade: '',
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it('renders all input fields and textareas', () => {
    render(<ContextualQuestions formData={initialFormData} setFormData={mockSetFormData} />);
    
    expect(screen.getByLabelText(/Briefly describe the conflict:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Who is involved?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/What is your relationship with the other party\/parties?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/What have you tried so far to resolve the conflict?/i)).toBeInTheDocument();
  });

  it('calls setFormData with updated value for conflictDescription', () => {
    render(<ContextualQuestions formData={initialFormData} setFormData={mockSetFormData} />);
    const textarea = screen.getByLabelText(/Briefly describe the conflict:/i);
    fireEvent.change(textarea, { target: { value: 'A big argument' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      conflictDescription: 'A big argument',
    });
  });

  it('calls setFormData with updated value for partiesInvolved', () => {
    render(<ContextualQuestions formData={initialFormData} setFormData={mockSetFormData} />);
    const input = screen.getByLabelText(/Who is involved?/i);
    fireEvent.change(input, { target: { value: 'Me and my neighbor' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      partiesInvolved: 'Me and my neighbor',
    });
  });

  it('calls setFormData with updated value for relationshipWithParties', () => {
    render(<ContextualQuestions formData={initialFormData} setFormData={mockSetFormData} />);
    const input = screen.getByLabelText(/What is your relationship with the other party\/parties?/i);
    fireEvent.change(input, { target: { value: 'Friendly neighbors' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      relationshipWithParties: 'Friendly neighbors',
    });
  });

  it('calls setFormData with updated value for attemptsMade', () => {
    render(<ContextualQuestions formData={initialFormData} setFormData={mockSetFormData} />);
    const textarea = screen.getByLabelText(/What have you tried so far to resolve the conflict?/i);
    fireEvent.change(textarea, { target: { value: 'Talking to them' } });
    expect(mockSetFormData).toHaveBeenCalledWith({
      ...initialFormData,
      attemptsMade: 'Talking to them',
    });
  });

  it('displays the current formData values in the fields', () => {
    const filledFormData = {
      conflictDescription: 'Test description',
      partiesInvolved: 'Test parties',
      relationshipWithParties: 'Test relationship',
      attemptsMade: 'Test attempts',
    };
    render(<ContextualQuestions formData={filledFormData} setFormData={mockSetFormData} />);

    expect(screen.getByLabelText(/Briefly describe the conflict:/i)).toHaveValue(filledFormData.conflictDescription);
    expect(screen.getByLabelText(/Who is involved?/i)).toHaveValue(filledFormData.partiesInvolved);
    expect(screen.getByLabelText(/What is your relationship with the other party\/parties?/i)).toHaveValue(filledFormData.relationshipWithParties);
    expect(screen.getByLabelText(/What have you tried so far to resolve the conflict?/i)).toHaveValue(filledFormData.attemptsMade);
  });
});
