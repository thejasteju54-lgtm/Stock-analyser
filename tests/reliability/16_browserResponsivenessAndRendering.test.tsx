/**
 * 16_browserResponsivenessAndRendering.test.tsx
 * Phase 17 — Browser UI Responsiveness & Rendering Performance Suite.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LiveDataStatusPanel } from '../../src/components/live/LiveDataStatusPanel';
import { LiveResearchControlPanel } from '../../src/components/live/LiveResearchControlPanel';

describe('Browser UI Responsiveness Suite', () => {
  it('renders LiveDataStatusPanel and LiveResearchControlPanel quickly without unhandled exceptions or lag', () => {
    const start = performance.now();

    const { getByText: getByTextStatus, unmount: unmountStatus } = render(<LiveDataStatusPanel />);
    expect(getByTextStatus(/Live Data Feeds/i)).toBeDefined();
    unmountStatus();

    const { getByText: getByTextControl, unmount: unmountControl } = render(
      <LiveResearchControlPanel
        symbol="TATAMOTORS"
        isReplayMode={false}
        onToggleMode={() => {}}
        onCutoffChange={() => {}}
        onRefreshData={() => {}}
        isRefreshing={false}
      />
    );

    expect(getByTextControl(/Live Data Mode/i)).toBeDefined();
    unmountControl();

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
