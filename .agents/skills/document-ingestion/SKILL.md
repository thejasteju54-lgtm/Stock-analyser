---
name: document-ingestion
description: Ingest, process, parse, and validate company financial documents including audited annual reports, quarterly investor presentations, press releases, and financial screenshot captures.
---

# Document Ingestion Skill

## Overview

This skill governs the ingestion, OCR processing, text layer extraction, and document classification pipeline for all research materials entered into the Indian Equity Research Terminal.

## Core Rules

1. **Strict Provenance**: Every ingested document must receive an immutable `documentId`, content hash (`SHA-256`), and page index.
2. **Real Binary Parsing**: PDFs must be parsed using `PDF.js` text layer extraction. Never substitute fake or simulated text pages in place of real file bytes.
3. **Scanned Page OCR**: Scanned documents and image screenshots must be processed via Optical Character Recognition (`Tesseract.js`).
4. **Confidence Scoring**: Flag OCR confidence per page. If OCR confidence falls below 70%, mark as `UNVERIFIED_OCR` and request analyst manual verification.
5. **No Synthetic Fallbacks**: If a document is unreadable or corrupted, fail gracefully with `DOCUMENT_PARSE_ERROR`. Never fabricate financial statement pages.

## Supported Document Types

- **Audited Annual Report** (`ANNUAL_REPORT`): 100–400+ page primary statutory filing.
- **Quarterly Financial Results** (`QUARTERLY_RESULTS`): Unaudited / limited review quarterly filings.
- **Investor Presentation** (`INVESTOR_PRESENTATION`): Management strategy, segment performance, and capex slides.
- **Concall Transcript** (`CONCALL_TRANSCRIPT`): Earnings conference call verbatim Q&A.
- **Financial Screener / Broker Screenshot** (`FINANCIAL_SCREENSHOT`): Single-page visual capture.

## Extraction Protocol

1. Compute document SHA-256 hash.
2. Extract page count and dimensions.
3. Extract text streams per page, preserving line breaks and table column alignments.
4. Classify reporting period (`fiscalYear`, `quarter`, `accountingBasis`).
5. Scan for table bounding boxes (Statement of Profit & Loss, Balance Sheet, Cash Flows, Segment Reporting, Borrowings Notes).
6. Emit structured `IngestedDocument` entity to research store.
