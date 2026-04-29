import { render, screen } from '@testing-library/react';
import App from './App';

test('renders category picker', () => {
  render(<App />);
  expect(screen.getByText(/Find your perfect match/i)).toBeInTheDocument();
  expect(screen.getByText(/Strollers/i)).toBeInTheDocument();
});
