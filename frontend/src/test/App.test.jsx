import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('should render without crashing', () => {
    // Wrap in MemoryRouter because App uses BrowserRouter internally
    // We render a minimal version to verify the component tree mounts
    const { container } = render(
      <App />
    );
    expect(container).toBeTruthy();
  });
});
