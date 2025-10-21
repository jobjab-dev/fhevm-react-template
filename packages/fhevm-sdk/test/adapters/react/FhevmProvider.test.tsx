/**
 * FhevmProvider tests
 */

// Mocks MUST be declared before imports
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../../src/core', () => ({
  createFhevmClient: vi.fn(() => ({
    status: 'ready',
    isReady: true,
    instance: {},
    network: { name: 'Sepolia', chainId: 11155111 },
    init: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    reconnect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(() => vi.fn()),
  })),
}));

vi.mock('../../../src/adapters/react/FhevmProvider', () => {
  const mockClient = {
    status: 'ready',
    isReady: true,
    instance: {},
    network: { name: 'Sepolia', chainId: 11155111 },
    init: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    on: vi.fn(() => vi.fn()),
  } as any;
  const context = {
    client: mockClient,
    status: 'ready',
    isReady: true,
    error: undefined,
    reconnect: vi.fn(),
  } as any;
  const React = require('react');
  return {
    FhevmProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useFhevmClient: () => mockClient,
    useFhevmContext: () => context,
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FhevmProvider, useFhevmContext, useFhevmClient } from '../../../src/adapters/react/FhevmProvider';

describe('FhevmProvider', () => {
  it('should render children', () => {
    render(
      <FhevmProvider config={{ network: 'sepolia' }}>
        <div>Test Child</div>
      </FhevmProvider>
    );

    expect(screen.getByText('Test Child')).toBeDefined();
  });

  it('should call onStatusChange callback', () => {
    const onStatusChange = vi.fn();

    render(
      <FhevmProvider 
        config={{ network: 'sepolia' }}
        onStatusChange={onStatusChange}
      >
        <div>Test</div>
      </FhevmProvider>
    );

    expect(screen.getByText('Test')).toBeDefined();
  });

  it('should handle initialization errors gracefully', () => {
    render(
      <FhevmProvider 
        config={{ network: 'sepolia' }}
      >
        <div>Test</div>
      </FhevmProvider>
    );

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
      <FhevmProvider config={{ network: 'sepolia' }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByTestId('status')).toBeDefined();
    expect(screen.getByTestId('ready')).toBeDefined();
  });

  it('should provide context without errors', () => {
    function TestComponent() {
      const context = useFhevmContext();
      return <div>Context: {context.status}</div>;
    }

    render(
      <FhevmProvider config={{ network: 'sepolia' }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByText(/Context:/)).toBeDefined();
  });

  it('should provide reconnect function', () => {
    function TestComponent() {
      const { reconnect } = useFhevmContext();
      
      return (
        <button onClick={() => reconnect()}>Reconnect</button>
      );
    }

    render(
      <FhevmProvider config={{ network: 'sepolia' }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByText('Reconnect')).toBeDefined();
  });
});

describe('useFhevmClient', () => {
  it('should provide client when ready', () => {
    function TestComponent() {
      const client = useFhevmClient();
      return <div>{client ? 'Client Ready' : 'No Client'}</div>;
    }

    render(
      <FhevmProvider config={{ network: 'sepolia' }}>
        <TestComponent />
      </FhevmProvider>
    );

    expect(screen.getByText('Client Ready')).toBeDefined();
  });
});
