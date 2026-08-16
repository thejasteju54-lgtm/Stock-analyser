import React, { useState } from 'react';
import { ManagementClaim, ManagementClaimCategory } from '../../domain/extraction/FinancialFactTypes';
import { Badge } from '../common/Badge';
import { MessageSquareQuote, Search, UserCheck } from 'lucide-react';

interface ManagementClaimsLedgerProps {
  claims: ManagementClaim[];
}

export const ManagementClaimsLedger: React.FC<ManagementClaimsLedgerProps> = ({ claims }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredClaims = claims.filter((claim) => {
    const matchesCat = selectedCategory === 'ALL' || claim.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      claim.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadgeVariant = (cat: ManagementClaimCategory): 'cyan' | 'neutral' | 'bullish' | 'warning' => {
    switch (cat) {
      case 'GUIDANCE':
        return 'cyan';
      case 'DELEVERAGING':
        return 'bullish';
      case 'CAPEX_PLAN':
        return 'warning';
      case 'OPERATIONAL_UPDATE':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-terminal-card/60 border border-terminal-border rounded">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <MessageSquareQuote className="w-4 h-4 text-accent-cyan" />
          <span className="font-bold text-terminal-text uppercase tracking-wider text-xs">
            Management Claims & Concall Guidance ({filteredClaims.length})
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-terminal-muted" />
            <input
              type="text"
              placeholder="Search speaker or claim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-terminal-dark border border-terminal-border rounded text-terminal-text text-xs focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 bg-terminal-dark border border-terminal-border rounded text-terminal-text text-xs focus:outline-none focus:border-accent-cyan cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="GUIDANCE">Guidance</option>
            <option value="DELEVERAGING">Deleveraging</option>
            <option value="CAPEX_PLAN">Capex Plan</option>
            <option value="OPERATIONAL_UPDATE">Operational Update</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="p-8 text-center bg-terminal-card/30 border border-terminal-border rounded text-terminal-muted">
          No management claims match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.claimId}
              className="p-3.5 bg-terminal-card/70 border border-terminal-border rounded hover:border-accent-cyan/60 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getCategoryBadgeVariant(claim.category)}>
                    {claim.category.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-[10px] text-terminal-muted">
                    {claim.documentName} (p.{claim.pageNumber || '1'})
                  </span>
                </div>

                <p className="text-[12px] text-terminal-text italic leading-relaxed bg-terminal-dark/60 p-2.5 rounded border border-terminal-border/40">
                  "{claim.claimText}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-terminal-border/40 text-[11px]">
                <div className="flex items-center space-x-1.5 text-accent-cyan font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{claim.speaker}</span>
                  {claim.speakerTitle && (
                    <span className="text-terminal-muted font-normal">({claim.speakerTitle})</span>
                  )}
                </div>
                <span className="text-terminal-muted text-[10px]">
                  Confidence: <strong className="text-status-success">{claim.confidence}%</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
