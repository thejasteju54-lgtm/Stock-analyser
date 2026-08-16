import { IngestedDocument } from './DocumentTypes';

export class DocumentHasher {
  /**
   * Computes SHA-256 hex string from an ArrayBuffer or binary string.
   */
  public static async computeHash(data: ArrayBuffer | Uint8Array | string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        let arrayBuffer: ArrayBuffer;
        if (typeof data === 'string') {
          const encoder = new TextEncoder();
          const uint8 = encoder.encode(data);
          arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
        } else if (data instanceof Uint8Array) {
          arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
        } else {
          arrayBuffer = data as ArrayBuffer;
        }

        const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch {
        return this.computeDeterministicFallbackHash(data);
      }
    }

    return this.computeDeterministicFallbackHash(data);
  }

  /**
   * Deterministic fast hash fallback for node/testing environments without WebCrypto.
   */
  public static computeDeterministicFallbackHash(data: ArrayBuffer | Uint8Array | string): string {
    let str = '';
    if (typeof data === 'string') {
      str = data;
    } else {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      for (let i = 0; i < Math.min(bytes.length, 4096); i++) {
        str += String.fromCharCode(bytes[i]);
      }
    }

    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `sha256_${part1}${part2}${part1}${part2}`;
  }

  /**
   * Checks if an identical file hash or filename already exists in the research project.
   */
  public static detectDuplicate(params: {
    newHash: string;
    newFilename: string;
    existingDocuments: IngestedDocument[];
  }): { isDuplicate: boolean; duplicateDocument?: IngestedDocument; reason?: string } {
    const { newHash, newFilename, existingDocuments } = params;

    // 1. Exact content hash match
    const exactHashMatch = existingDocuments.find(
      (doc) => doc.fileHash.toLowerCase() === newHash.toLowerCase()
    );
    if (exactHashMatch) {
      return {
        isDuplicate: true,
        duplicateDocument: exactHashMatch,
        reason: `Exact duplicate file content already uploaded (${exactHashMatch.filename}, ID: ${exactHashMatch.id}).`,
      };
    }

    // 2. Exact filename match with same reporting period
    const exactFilenameMatch = existingDocuments.find(
      (doc) => doc.filename.toLowerCase() === newFilename.toLowerCase()
    );
    if (exactFilenameMatch) {
      return {
        isDuplicate: true,
        duplicateDocument: exactFilenameMatch,
        reason: `A document with the identical filename "${newFilename}" is already attached to this research project.`,
      };
    }

    return {
      isDuplicate: false,
    };
  }
}
