import { DocumentType } from './DocumentTypes';

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number; // 0-100
  matchedKeywords: string[];
  requiresReview: boolean;
  notes: string;
}

interface ClassifierRule {
  type: DocumentType;
  priority: number;
  patterns: RegExp[];
  mimePattern?: RegExp;
}

const CLASSIFIER_RULES: ClassifierRule[] = [
  {
    type: 'ANNUAL_REPORT',
    priority: 10,
    patterns: [
      /(?:^|[\s_./-])annual[\s_./-]?report(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])(?:ar|integrated[\s_./-]?report)[\s_./-]?(?:20\d{2}|\d{2})(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])annual[\s_./-]?filing(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])form[\s_./-]?20[\s_./-]?f(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])annual[\s_./-]?financials?(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'CONCALL_TRANSCRIPT',
    priority: 9,
    patterns: [
      /(?:^|[\s_./-])(?:concall|earnings[\s_./-]?call|transcript|conference[\s_./-]?call)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])q[1-4][\s_./-]?(?:fy)?\d{2,4}[\s_./-]?(?:concall|transcript)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])earnings[\s_./-]?transcript(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'INVESTOR_PRESENTATION',
    priority: 8,
    patterns: [
      /(?:^|[\s_./-])(?:investor[\s_./-]?presentation|investor[\s_./-]?deck|corporate[\s_./-]?presentation|inv[\s_./-]?deck|earnings[\s_./-]?presentation)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])(?:ip|presentation)[\s_./-]?(?:q[1-4]|fy\d{2,4})(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'FINANCIAL_STATEMENTS',
    priority: 7,
    patterns: [
      /(?:^|[\s_./-])(?:financial[\s_./-]?results|audited[\s_./-]?results|unaudited[\s_./-]?results|balance[\s_./-]?sheet|profit[\s_./-]?and[\s_./-]?loss|p&l|cash[\s_./-]?flow)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])(?:quarterly[\s_./-]?financials|standalone[\s_./-]?results|consolidated[\s_./-]?results)(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'MDA',
    priority: 6,
    patterns: [
      /(?:^|[\s_./-])(?:mda|management[\s_./-]?discussion|management[\s_./-]?analysis|md&a)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])management[\s_./-]?commentary(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'SHAREHOLDING_PATTERN',
    priority: 5,
    patterns: [
      /(?:^|[\s_./-])(?:shareholding|shareholding[\s_./-]?pattern|promoter[\s_./-]?holding|shp|insider[\s_./-]?trading)(?:[\s_./-]|$)/i,
      /(?:^|[\s_./-])clause[\s_./-]?35(?:[\s_./-]|$)/i,
    ],
  },
  {
    type: 'SCREENER_SCREENSHOT',
    priority: 4,
    patterns: [
      /(?:^|[\s_./-])(?:screener|screener[\s_./-]?in|ratios[\s_./-]?screenshot|financial[\s_./-]?screenshot)(?:[\s_./-]|$)/i,
    ],
    mimePattern: /^image\//i,
  },
  {
    type: 'TECHNICAL_CHART',
    priority: 3,
    patterns: [
      /(?:^|[\s_./-])(?:chart|technical|tradingview|candlestick|weekly[\s_./-]?chart|daily[\s_./-]?chart|dma|breakout|support[\s_./-]?resistance)(?:[\s_./-]|$)/i,
    ],
    mimePattern: /^image\//i,
  },
];

export class DocumentClassifier {
  public static classify(params: {
    filename: string;
    mimeType: string;
    textSample?: string;
  }): ClassificationResult {
    const { filename, mimeType, textSample = '' } = params;
    const targetFilename = ` ${filename} `;
    const targetText = ` ${textSample.slice(0, 1000)} `;

    for (const rule of CLASSIFIER_RULES) {
      if (rule.mimePattern && !rule.mimePattern.test(mimeType)) {
        continue;
      }

      const matches: string[] = [];
      for (const pattern of rule.patterns) {
        if (pattern.test(targetFilename)) {
          matches.push(pattern.source);
        } else if (textSample && pattern.test(targetText)) {
          matches.push(`content:${pattern.source}`);
        }
      }

      if (matches.length > 0) {
        return {
          documentType: rule.type,
          confidence: Math.min(75 + matches.length * 10, 98),
          matchedKeywords: matches,
          requiresReview: false,
          notes: `Deterministic rule match for ${rule.type} on [${matches.join(', ')}]`,
        };
      }
    }

    // Default fallback based strictly on MIME type without guessing
    if (mimeType.startsWith('image/')) {
      // Ambiguous image upload
      return {
        documentType: 'SCREENER_SCREENSHOT',
        confidence: 60,
        matchedKeywords: ['image_mime_default'],
        requiresReview: true,
        notes: 'Unclassified image upload defaulting to screenshot evidence with review requirement.',
      };
    }

    if (mimeType === 'application/pdf') {
      return {
        documentType: 'UNKNOWN',
        confidence: 40,
        matchedKeywords: [],
        requiresReview: true,
        notes: 'Unclassified PDF document requiring analyst confirmation before evidence extraction.',
      };
    }

    return {
      documentType: 'OTHER',
      confidence: 50,
      matchedKeywords: [],
      requiresReview: true,
      notes: 'General research document not matching standardized Indian corporate filing schemas.',
    };
  }
}
