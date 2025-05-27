import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MediatorSelection from '../MediatorSelection'; // Adjust path as necessary

describe('MediatorSelection Component', () => {
  const mockSetSelectedMediator = jest.fn();

  beforeEach(() => {
    mockSetSelectedMediator.mockClear();
  });

  it('renders all mediator type radio buttons', () => {
    render(<MediatorSelection selectedMediator="" setSelectedMediator={mockSetSelectedMediator} />);
    
    expect(screen.getByLabelText(/Neutral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empathetic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Direct/i)).toBeInTheDocument();
  });

  it('calls setSelectedMediator with "neutral" when Neutral option is clicked', () => {
    render(<MediatorSelection selectedMediator="" setSelectedMediator={mockSetSelectedMediator} />);
    const neutralRadio = screen.getByLabelText(/Neutral/i);
    fireEvent.click(neutralRadio);
    expect(mockSetSelectedMediator).toHaveBeenCalledWith('neutral');
  });

  it('calls setSelectedMediator with "empathetic" when Empathetic option is clicked', () => {
    render(<MediatorSelection selectedMediator="" setSelectedMediator={mockSetSelectedMediator} />);
    const empatheticRadio = screen.getByLabelText(/Empathetic/i);
    fireEvent.click(empatheticRadio);
    expect(mockSetSelectedMediator).toHaveBeenCalledWith('empathetic');
  });

  it('calls setSelectedMediator with "direct" when Direct option is clicked', () => {
    render(<MediatorSelection selectedMediator="" setSelectedMediator={mockSetSelectedMediator} />);
    const directRadio = screen.getByLabelText(/Direct/i);
    fireEvent.click(directRadio);
    expect(mockSetSelectedMediator).toHaveBeenCalledWith('direct');
  });

  it('displays the currently selected mediator style as checked', () => {
    render(<MediatorSelection selectedMediator="empathetic" setSelectedMediator={mockSetSelectedMediator} />);
    
    const neutralRadio = screen.getByLabelText(/Neutral/i) as HTMLInputElement;
    const empatheticRadio = screen.getByLabelText(/Empathetic/i) as HTMLInputElement;
    const directRadio = screen.getByLabelText(/Direct/i) as HTMLInputElement;

    expect(neutralRadio.checked).toBe(false);
    expect(empatheticRadio.checked).toBe(true);
    expect(directRadio.checked).toBe(false);
  });

  it('updates the checked status when a new mediator style is selected', () => {
    const { rerender } = render(<MediatorSelection selectedMediator="neutral" setSelectedMediator={mockSetSelectedMediator} />);
    
    let neutralRadio = screen.getByLabelText(/Neutral/i) as HTMLInputElement;
    expect(neutralRadio.checked).toBe(true);

    // Simulate prop change as if parent state updated
    rerender(<MediatorSelection selectedMediator="direct" setSelectedMediator={mockSetSelectedMediator} />);
    
    neutralRadio = screen.getByLabelText(/Neutral/i) as HTMLInputElement; // Re-query after rerender
    const directRadio = screen.getByLabelText(/Direct/i) as HTMLInputElement;
    
    expect(neutralRadio.checked).toBe(false);
    expect(directRadio.checked).toBe(true);
  });
});
