import { EntityMention, CompanyRelevance } from './NewsAndIndustryTypes';

export interface CompanyEntityProfile {
  symbol: string;
  legalName: string;
  displayName: string;
  aliases: string[];
  subsidiaries: string[];
  brands: string[];
  promoters: string[];
  management: string[];
  competitors: string[];
  sector: string;
}

export class EntityResolutionEngine {
  /**
   * Resolves mentions in news text against the target company entity profile.
   */
  public static resolveEntities(
    headline: string,
    body: string,
    profile: CompanyEntityProfile
  ): {
    companyEntities: EntityMention[];
    peopleEntities: EntityMention[];
    industryEntities: EntityMention[];
    relevance: CompanyRelevance;
  } {
    const text = `${headline} ${body}`.toLowerCase();
    const headlineLower = headline.toLowerCase();

    const companyEntities: EntityMention[] = [];
    const peopleEntities: EntityMention[] = [];
    const industryEntities: EntityMention[] = [];

    let isDirectInHeadline = false;
    let isDirectInBody = false;
    let isSubsidiaryMentioned = false;
    let isCompetitorSubject = false;

    // 1. Direct Company Matching (Ticker, Display Name, Legal Name, Aliases)
    const directNames = [
      profile.symbol.toLowerCase(),
      profile.displayName.toLowerCase(),
      profile.legalName.toLowerCase(),
      ...profile.aliases.map((a) => a.toLowerCase()),
    ];

    for (const name of directNames) {
      if (name.length < 2) continue;
      const regex = new RegExp(`\\b${this.escapeRegex(name)}\\b`, 'i');
      if (regex.test(headlineLower)) {
        isDirectInHeadline = true;
        companyEntities.push({
          entityId: `ent_co_${profile.symbol}`,
          name: profile.displayName,
          type: 'COMPANY',
          role: 'PRIMARY_ENTITY',
        });
        break;
      } else if (regex.test(text)) {
        isDirectInBody = true;
        companyEntities.push({
          entityId: `ent_co_${profile.symbol}`,
          name: profile.displayName,
          type: 'COMPANY',
          role: 'SECONDARY_ENTITY',
        });
        break;
      }
    }

    // 2. Subsidiary & Brand Matching
    for (const sub of profile.subsidiaries) {
      const regex = new RegExp(`\\b${this.escapeRegex(sub.toLowerCase())}\\b`, 'i');
      if (regex.test(text)) {
        isSubsidiaryMentioned = true;
        companyEntities.push({
          entityId: `ent_sub_${sub.replace(/\s+/g, '_')}`,
          name: sub,
          type: 'SUBSIDIARY',
          role: isDirectInHeadline ? 'PRIMARY_ENTITY' : 'SECONDARY_ENTITY',
        });
      }
    }

    for (const brand of profile.brands) {
      const regex = new RegExp(`\\b${this.escapeRegex(brand.toLowerCase())}\\b`, 'i');
      if (regex.test(text)) {
        companyEntities.push({
          entityId: `ent_brand_${brand.replace(/\s+/g, '_')}`,
          name: brand,
          type: 'BRAND',
          role: isDirectInHeadline ? 'PRIMARY_ENTITY' : 'SECONDARY_ENTITY',
        });
      }
    }

    // 3. Promoters & Management Matching
    for (const prom of profile.promoters) {
      if (new RegExp(`\\b${this.escapeRegex(prom.toLowerCase())}\\b`, 'i').test(text)) {
        peopleEntities.push({
          entityId: `ent_prom_${prom.replace(/\s+/g, '_')}`,
          name: prom,
          type: 'PROMOTER',
          role: isDirectInHeadline ? 'PRIMARY_ENTITY' : 'SECONDARY_ENTITY',
        });
      }
    }

    for (const mgmt of profile.management) {
      if (new RegExp(`\\b${this.escapeRegex(mgmt.toLowerCase())}\\b`, 'i').test(text)) {
        peopleEntities.push({
          entityId: `ent_mgmt_${mgmt.replace(/\s+/g, '_')}`,
          name: mgmt,
          type: 'MANAGEMENT',
          role: isDirectInHeadline ? 'PRIMARY_ENTITY' : 'SECONDARY_ENTITY',
        });
      }
    }

    // 4. Competitor Matching
    for (const comp of profile.competitors) {
      if (new RegExp(`\\b${this.escapeRegex(comp.toLowerCase())}\\b`, 'i').test(headlineLower)) {
        isCompetitorSubject = true;
        companyEntities.push({
          entityId: `ent_comp_${comp.replace(/\s+/g, '_')}`,
          name: comp,
          type: 'COMPETITOR',
          role: 'PRIMARY_ENTITY',
        });
      } else if (new RegExp(`\\b${this.escapeRegex(comp.toLowerCase())}\\b`, 'i').test(text)) {
        companyEntities.push({
          entityId: `ent_comp_${comp.replace(/\s+/g, '_')}`,
          name: comp,
          type: 'COMPETITOR',
          role: 'SECONDARY_ENTITY',
        });
      }
    }

    // 5. Industry / Sector Matching
    if (profile.sector && new RegExp(`\\b${this.escapeRegex(profile.sector.toLowerCase())}\\b`, 'i').test(text)) {
      industryEntities.push({
        entityId: `ent_sec_${profile.sector.replace(/\s+/g, '_')}`,
        name: profile.sector,
        type: 'SECTOR',
        role: isDirectInHeadline ? 'PRIMARY_ENTITY' : 'SECONDARY_ENTITY',
      });
    }

    // Regulators
    const regulators = ['SEBI', 'RBI', 'CCI', 'NCLT', 'Ministry of Finance'];
    for (const reg of regulators) {
      if (new RegExp(`\\b${this.escapeRegex(reg.toLowerCase())}\\b`, 'i').test(text)) {
        industryEntities.push({
          entityId: `ent_reg_${reg}`,
          name: reg,
          type: 'REGULATOR',
          role: 'SECONDARY_ENTITY',
        });
      }
    }

    // 6. Determine Company Relevance
    let relevance: CompanyRelevance = 'IRRELEVANT';

    if (isDirectInHeadline) {
      relevance = 'DIRECT_COMPANY';
    } else if (isSubsidiaryMentioned || (isDirectInBody && !isCompetitorSubject)) {
      relevance = 'MATERIAL_COMPANY';
    } else if (isDirectInBody && isCompetitorSubject) {
      relevance = 'INDIRECT_COMPANY'; // Company mentioned in passing inside competitor's article
    } else if (industryEntities.length > 0) {
      relevance = 'SECTOR_ONLY';
    }

    // If company entity was found only as a minor mention in competitor article, downgrade role
    if (relevance === 'INDIRECT_COMPANY') {
      companyEntities.forEach((ent) => {
        if (ent.entityId === `ent_co_${profile.symbol}`) {
          ent.role = 'MENTION_ONLY';
        }
      });
    }

    return {
      companyEntities,
      peopleEntities,
      industryEntities,
      relevance,
    };
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
