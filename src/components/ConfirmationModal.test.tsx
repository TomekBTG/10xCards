import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Potwierdź akcję',
    description: 'Czy na pewno chcesz wykonać tę akcję?',
    confirmLabel: 'Potwierdź',
    cancelLabel: 'Anuluj',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('nie renderuje nic, gdy isOpen jest false', () => {
    const { container } = render(
      <ConfirmationModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderuje tytuł i opis', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Potwierdź akcję')).toBeInTheDocument();
    expect(screen.getByText('Czy na pewno chcesz wykonać tę akcję?')).toBeInTheDocument();
  });

  it('renderuje przyciski z odpowiednimi etykietami', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Potwierdź')).toBeInTheDocument();
    expect(screen.getByText('Anuluj')).toBeInTheDocument();
  });

  it('wywołuje onConfirm po kliknięciu przycisku potwierdzenia', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Potwierdź'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('wywołuje onCancel po kliknięciu przycisku anulowania', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Anuluj'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renderuje dodatkową zawartość przekazaną jako children', () => {
    render(
      <ConfirmationModal {...defaultProps}>
        <div data-testid="child-content">Dodatkowa zawartość</div>
      </ConfirmationModal>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Dodatkowa zawartość')).toBeInTheDocument();
  });
}); 