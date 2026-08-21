/**
 * 34_liveResearchControlPanelUI.test.tsx
 * Phase 16 — Live Research Control Bar & Status Panel UI Component Verification.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveResearchControlPanel } from '../../../src/components/live/LiveResearchControlPanel';
import { LiveDataStatusPanel } from '../../../src/components/live/LiveDataStatusPanel';
import { DataSourceConfigurationView } from '../../../src/components/live/DataSourceConfigurationView';

describe('Live Research UI Components (Phase 16)', () => {
  it('renders LiveResearchControlPanel with active controls', () => {
    render(
      <LiveResearchControlPanel
        symbol="TATAMOTORS"
        isReplayMode={false}
        onToggleMode={() => {}}
        onCutoffChange={() => {}}
        onRefreshData={() => {}}
      />
    );

    expect(screen.getByText(/Live Data Mode/i)).toBeDefined();
    expect(screen.getByText(/Refresh Feeds \(TATAMOTORS\)/i)).toBeDefined();
  });

  it('renders LiveDataStatusPanel with provider tiles', () => {
    render(<LiveDataStatusPanel />);
    expect(screen.getByText(/Live Data Feeds & Connectivity Status/i)).toBeDefined();
    expect(screen.getByText(/NSE_OFFICIAL_FEED/i)).toBeDefined();
  });

  it('renders DataSourceConfigurationView with provider governance table', () => {
    render(<DataSourceConfigurationView />);
    expect(screen.getByText(/Data Sources & Provider Governance/i)).toBeDefined();
    expect(screen.getByText(/BSE_CORPORATE_DISCLOSURES/i)).toBeDefined();
  });
});
