/**
 * FhevmProvider tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FhevmProvider, useFhevmContext, useFhevmClient } from '../../../src/adapters/react/FhevmProvider';
import React from 'react';

describe('FhevmProvider', () => {
  it('should render children', () => {
    render(
      <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
        <div>Test Child</div>
      </FhevmProvider>
    );

    expect(screen.getByText('Test Child')).toBeDefined();
  });

  it('should call onStatusChange callback', () => {
    const onStatusChange = vi.fn();

    render(
      <FhevmProvider 
        config={{ network: 'sepolia', autoInit: false }}
        onStatusChange={onStatusChange}
      >
        <div>Test</div>
      </FhevmProvider>
    );

    // Status change is async, callback should be called eventually
    expect(onStatusChange).toHaveBeenCalledWith('idle');
  });

  it('should handle initialization errors gracefully', () => {
    const onError = vi.fn();

    render(
      <FhevmProvider 
        config={{ network: 'invalid' as any, autoInit: false }}
        onError={onError}
      >
        <div>Test</div>
      </FhevmProvider>
    );

    // Should not crash on invalid network
    expect(screen.getByText('Test')).toBeDefined();
  });
});

describe('useFhevmContext', () => {
  it('should provide context values', () => {
    function TestComponent() {
      const context = useFhevmContext();
      
      return (
        <div>
          <span data-testid="status">{context.status}</span>
          <span data-testid="ready">{String(context.isReady)}</span>
        </div>
      );
    }

    render(
      <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByTestId('status')).toBeDefined();
    expect(screen.getByTestId('ready').textContent).toBe('false');
  });

  it('should throw when used outside provider', () => {
    function TestComponent() {
      useFhevmContext();
      return <div>Test</div>;
    }

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow('must be used within a FhevmProvider');

    console.error = originalError;
  });

  it('should provide reconnect function', () => {
    function TestComponent() {
      const { reconnect } = useFhevmContext();
      
      return (
        <button onClick={() => reconnect()}>Reconnect</button>
      );
    }

    render(
      <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByText('Reconnect')).toBeDefined();
  });
});

describe('useFhevmClient', () => {
  it('should throw when client is not ready', () => {
    function TestComponent() {
      useFhevmClient();
      return <div>Test</div>;
    }

    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(
      <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
        <TestComponent />
      </FhevmProvider>
    )).toThrow('not ready');

    console.error = originalError;
  });
});

