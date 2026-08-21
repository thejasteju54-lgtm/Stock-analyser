import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../../src/App';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';

describe('Phase 1 — Application Shell & Terminal Layout', () => {
  it('renders the terminal layout with TopBar, SideNav, StatusBar and Overview viewport', () => {
    render(<App />);

    // Verify Brand / TopBar
    expect(screen.getByText(/Equity Intelligence Terminal/i)).toBeInTheDocument();
    expect(screen.getByText(/Institutional Grade/i)).toBeInTheDocument();

    // Verify Active Company Context in TopBar and Overview
    const companyMatches = screen.getAllByText(/Tata Motors Limited/i);
    expect(companyMatches.length).toBeGreaterThanOrEqual(1);
    const tickerMatches = screen.getAllByText(/NSE:TATAMOTORS/i);
    expect(tickerMatches.length).toBeGreaterThanOrEqual(1);

    // Verify Overview View Title
    expect(screen.getByText(/Indian Equity Research Intelligence Terminal/i)).toBeInTheDocument();

    // Verify SideNav navigation items exist
    expect(screen.getByRole('button', { name: /Terminal Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Document Ingestion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Forensic Accounting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sector Valuation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Data Quality Gate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Investment Verdict/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Evidence Explorer/i })).toBeInTheDocument();

    // Verify Bottom StatusBar
    expect(screen.getByText(/ZERO_FABRICATION_POLICY_ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/MODULAR_MONOLITH_ACTIVE/i)).toBeInTheDocument();
  });

  it('switches views when clicking a navigation item in SideNav', () => {
    render(<App />);

    // Test navigating to Phase 7 Forensic module
    const forensicNavButton = screen.getByRole('button', { name: /Forensic Accounting/i });
    fireEvent.click(forensicNavButton);
    expect(screen.getByText(/Forensic Accounting & Earnings-Quality Investigation/i)).toBeInTheDocument();

    // Test navigating to Phase 9 Sector Valuation module
    const valNavButton = screen.getByRole('button', { name: /Sector Valuation/i });
    fireEvent.click(valNavButton);
    expect(screen.getByText(/Phase 9 — Sector-Aware Valuation Engine/i)).toBeInTheDocument();

    // Test navigating to Phase 10 Technical Analysis module
    const techNavButton = screen.getByRole('button', { name: /Technical Structure/i });
    fireEvent.click(techNavButton);
    expect(screen.getByText(/Phase 10 — Technical Analysis & Price-Action Intelligence/i)).toBeInTheDocument();

    // Test navigating to Phase 11 News module
    const newsNavButton = screen.getByRole('button', { name: /News Intelligence/i });
    fireEvent.click(newsNavButton);
    expect(screen.getByText(/News Intelligence & Real-Time Event Research/i)).toBeInTheDocument();

    // Test navigating to Phase 12 Risks module
    const catNavButton = screen.getByRole('button', { name: /Catalysts & Risks/i });
    fireEvent.click(catNavButton);
    expect(screen.getByText(/Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix/i)).toBeInTheDocument();

    // Test navigating to Phase 13 Scenarios module
    const scenNavButton = screen.getByRole('button', { name: /Scenario Modeling/i });
    fireEvent.click(scenNavButton);
    expect(screen.getByText(/Scenario Modeling & Forward Financial Projection Engine/i)).toBeInTheDocument();

    // Test navigating to Phase 14 Investment Verdict module
    const verdictNavButton = screen.getByRole('button', { name: /Investment Verdict/i });
    fireEvent.click(verdictNavButton);
    expect(screen.getByText(/Price, Valuation & Margin of Safety/i)).toBeInTheDocument();

    // Click Overview Nav button
    const overviewNavButton = screen.getByRole('button', { name: /Overview/i });
    fireEvent.click(overviewNavButton);

    expect(screen.getByText(/Indian Equity Research Intelligence Terminal/i)).toBeInTheDocument();
  });

  it('renders reusable UI primitives (Badge, Card, Button) correctly', () => {
    render(
      <Card title="Test Card" action={<Badge variant="bullish">BUY</Badge>}>
        <Button variant="primary">Submit Research</Button>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('BUY')).toHaveClass('badge-bullish');
    expect(screen.getByRole('button', { name: 'Submit Research' })).toHaveClass('terminal-btn-primary');
  });

  it('catches runtime errors in ErrorBoundary without crashing the application', () => {
    const ProblematicComponent = () => {
      throw new Error('Test Engine Failure');
    };

    // Spy on console.error to keep test output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Terminal Runtime Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Engine Failure/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
