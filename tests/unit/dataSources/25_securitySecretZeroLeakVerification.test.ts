/**
 * 25_securitySecretZeroLeakVerification.test.ts
 * Phase 16 — Zero Secret Leak & Credentials Protection Verification.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceMetadataRegistry } from '../../../src/domain/dataSources/DataSourceMetadataRegistry';
import { CanonicalJsonSerializer } from '../../../src/domain/audit/CanonicalJsonSerializer';

describe('Security Secret Zero Leak Verification (Phase 16)', () => {
  it('ensures data source metadata and serializations never contain private credentials or API keys', () => {
    const all = DataSourceMetadataRegistry.getAllMetadata();
    const serialized = CanonicalJsonSerializer.canonicalize(all);

    expect(serialized).not.toContain('apiKey');
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('bearer');
    expect(serialized).not.toContain('password');
  });
});
