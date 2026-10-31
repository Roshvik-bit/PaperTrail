// =====================================================================
// PAPERTRAIL RESEARCH IMPORT & RESTORATION ENGINE
// Validates, parses, and restores research archives (ZIP or JSON)
// Prevents path traversal, checks schema versions, resolves duplicates
// =====================================================================

import {
  ResearchBundle,
  ResearchImportResult,
  ResearchExportManifest,
  Paper,
  Claim,
  ExperimentalContext,
  EvidenceRelationship,
  ResearchGap,
  GapInvestigationReport,
  ProposedExperiment,
  Dataset,
  PaperLineage,
  RetractionAlert,
  CrossDomainConnection,
  EvidenceEvolutionEvent
} from '@/types';
import { extractZipArchive } from './zip-utils';
import { ResearchRepository } from '../db/repository-interface';

export interface ImportOptions {
  mode?: 'CREATE_NEW' | 'MERGE' | 'REPLACE';
  targetSessionId?: string;
  overwriteConfirmed?: boolean;
}

export class ResearchImportService {
  /**
   * Parses raw file input (Buffer for ZIP, or string/Buffer for JSON) into a verified ResearchBundle
   */
  static parseArchive(rawInput: Buffer | string): ResearchBundle {
    // If rawInput is a string or starts with '{', attempt JSON parse
    if (typeof rawInput === 'string' || (Buffer.isBuffer(rawInput) && rawInput[0] === 0x7b /* '{' */)) {
      const jsonText = typeof rawInput === 'string' ? rawInput : rawInput.toString('utf8');
      try {
        const parsed = JSON.parse(jsonText);
        return this.validateBundle(parsed);
      } catch (err: any) {
        throw new Error(`Invalid JSON research bundle: ${err.message}`);
      }
    }

    // Otherwise, treat as ZIP archive buffer
    if (!Buffer.isBuffer(rawInput)) {
      throw new Error('Unsupported archive input type.');
    }

    const entries = extractZipArchive(rawInput);

    // 1. Manifest is mandatory
    const manifestEntry = entries['manifest.json'] || entries['papertrail-research/manifest.json'];
    if (!manifestEntry) {
      throw new Error('Invalid PaperTrail archive: manifest.json is missing.');
    }

    let manifest: ResearchExportManifest;
    try {
      manifest = manifestEntry.json<ResearchExportManifest>();
    } catch {
      throw new Error('Corrupted manifest.json in research archive.');
    }

    if (!manifest.format_version || !manifest.format_version.startsWith('1.')) {
      throw new Error(`Incompatible archive schema version: ${manifest.format_version || 'unknown'}. Expected 1.x.x`);
    }

    // Helper to safely parse JSON from entry if it exists
    const parseEntryJson = <T>(key: string, fallback: T): T => {
      const entry = entries[key] || entries[`papertrail-research/${key}`];
      if (!entry) return fallback;
      try {
        return entry.json<T>();
      } catch {
        return fallback;
      }
    };

    // Reconstruct bundle
    const papers = parseEntryJson<Paper[]>('papers/papers.json', []);
    const claims = parseEntryJson<Claim[]>('claims/claims.json', []);
    const relationships = parseEntryJson<EvidenceRelationship[]>('evidence/evidence_relationships.json', []);
    const gaps = parseEntryJson<ResearchGap[]>('research-gaps/gaps.json', []);
    const investigations = parseEntryJson<GapInvestigationReport[]>('research-gaps/falsification_reports.json', []);
    const experiments = parseEntryJson<ProposedExperiment[]>('experiments/experiments.json', []);
    const datasets = parseEntryJson<Dataset[]>('datasets/datasets.json', []);
    const lineages = parseEntryJson<PaperLineage[]>('provenance/lineage.json', []);
    const retraction_alerts = parseEntryJson<RetractionAlert[]>('provenance/retraction_alerts.json', []);
    const cross_domain = parseEntryJson<CrossDomainConnection[]>('provenance/cross_domain.json', []);
    const evolution_events = parseEntryJson<EvidenceEvolutionEvent[]>('timeline/evolution_timeline.json', []);

    // Create session entity
    const session = {
      id: manifest.session_id,
      title: manifest.title || 'Imported Investigation',
      research_question: manifest.research_question || 'Restored Research Question',
      domain: manifest.domain || 'edge_ai',
      status: 'ACTIVE' as const,
      budget_limit: 5.00,
      cost_accumulated: 0.00,
      created_at: manifest.exported_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const bundle: ResearchBundle = {
      manifest,
      session,
      papers,
      claims,
      contexts: [],
      relationships,
      gaps,
      investigations,
      experiments,
      datasets,
      lineages,
      retraction_alerts,
      cross_domain,
      evolution_events,
    };

    return this.validateBundle(bundle);
  }

  /**
   * Validates schema integrity and sanitizes fields
   */
  static validateBundle(bundle: any): ResearchBundle {
    if (!bundle || typeof bundle !== 'object') {
      throw new Error('Invalid bundle: expected an object.');
    }

    if (!bundle.manifest || !bundle.manifest.format_version) {
      throw new Error('Bundle validation failed: missing manifest or format_version.');
    }

    if (!bundle.session || !bundle.session.research_question) {
      throw new Error('Bundle validation failed: missing session research question.');
    }

    return {
      manifest: bundle.manifest,
      session: {
        id: String(bundle.session.id || `sess_${Math.random().toString(36).substring(2, 9)}`),
        title: String(bundle.session.title || 'Imported Research'),
        research_question: String(bundle.session.research_question),
        domain: String(bundle.session.domain || 'edge_ai'),
        status: bundle.session.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
        budget_limit: Number(bundle.session.budget_limit) || 5.00,
        cost_accumulated: Number(bundle.session.cost_accumulated) || 0.00,
        created_at: String(bundle.session.created_at || new Date().toISOString()),
        updated_at: new Date().toISOString(),
      },
      papers: Array.isArray(bundle.papers) ? bundle.papers : [],
      claims: Array.isArray(bundle.claims) ? bundle.claims : [],
      contexts: Array.isArray(bundle.contexts) ? bundle.contexts : [],
      relationships: Array.isArray(bundle.relationships) ? bundle.relationships : [],
      gaps: Array.isArray(bundle.gaps) ? bundle.gaps : [],
      investigations: Array.isArray(bundle.investigations) ? bundle.investigations : [],
      experiments: Array.isArray(bundle.experiments) ? bundle.experiments : [],
      datasets: Array.isArray(bundle.datasets) ? bundle.datasets : [],
      lineages: Array.isArray(bundle.lineages) ? bundle.lineages : [],
      retraction_alerts: Array.isArray(bundle.retraction_alerts) ? bundle.retraction_alerts : [],
      cross_domain: Array.isArray(bundle.cross_domain) ? bundle.cross_domain : [],
      evolution_events: Array.isArray(bundle.evolution_events) ? bundle.evolution_events : [],
    };
  }

  /**
   * Ingests and restores the parsed bundle into the active research repository
   */
  static async restoreIntoRepository(
    repo: ResearchRepository,
    bundle: ResearchBundle,
    options: ImportOptions = {}
  ): Promise<ResearchImportResult> {
    const warnings: string[] = [];
    const mode = options.mode || 'CREATE_NEW';

    // 1. Check if session already exists
    const existing = await repo.getSession(bundle.session.id);
    let targetSessionId = bundle.session.id;
    let action: ResearchImportResult['action'] = 'CREATED_NEW';

    if (existing) {
      if (mode === 'REPLACE') {
        if (!options.overwriteConfirmed) {
          throw new Error(`Safety violation: Session "${existing.title}" already exists. Overwrite confirmation required.`);
        }
        action = 'REPLACED';
        targetSessionId = existing.id;
        await repo.updateSession(targetSessionId, {
          title: bundle.session.title,
          research_question: bundle.session.research_question,
          domain: bundle.session.domain,
          updated_at: new Date().toISOString(),
        });
      } else if (mode === 'MERGE') {
        action = 'MERGED';
        targetSessionId = existing.id;
      } else {
        // CREATE_NEW: assign fresh unique ID
        action = 'CREATED_NEW';
        targetSessionId = `sess_imp_${Math.random().toString(36).substring(2, 9)}`;
        bundle.session.id = targetSessionId;
        await repo.createSession(
          `${bundle.session.title} (Imported)`,
          bundle.session.research_question,
          bundle.session.domain,
          targetSessionId
        );
      }
    } else {
      action = 'CREATED_NEW';
      await repo.createSession(
        bundle.session.title,
        bundle.session.research_question,
        bundle.session.domain,
        targetSessionId
      );
    }

    // 2. Ingest papers
    let paperCount = 0;
    for (const paper of bundle.papers) {
      try {
        await repo.savePaper(paper, targetSessionId);
        paperCount++;
      } catch (err: any) {
        warnings.push(`Paper "${paper.title}" skipped: ${err.message}`);
      }
    }

    // 3. Ingest claims
    let claimCount = 0;
    if (bundle.claims.length > 0) {
      try {
        await repo.saveClaims(bundle.claims);
        claimCount = bundle.claims.length;
      } catch (err: any) {
        warnings.push(`Claims batch save failed: ${err.message}`);
      }
    }

    // 4. Ingest contexts
    let contextCount = 0;
    for (const ctx of bundle.contexts) {
      try {
        await repo.saveContext(ctx);
        contextCount++;
      } catch {}
    }

    // 5. Ingest relationships
    let relCount = 0;
    for (const rel of bundle.relationships) {
      try {
        await repo.saveRelationship(rel);
        relCount++;
      } catch {}
    }

    // 6. Ingest research gaps & investigations
    let gapCount = 0;
    for (const gap of bundle.gaps) {
      try {
        gap.session_id = targetSessionId;
        await repo.saveGap(gap);
        gapCount++;
      } catch {}
    }

    for (const inv of bundle.investigations) {
      try {
        await repo.saveInvestigation(inv);
      } catch {}
    }

    // 7. Ingest experiments
    let expCount = 0;
    for (const exp of bundle.experiments) {
      try {
        await repo.saveExperiment(exp);
        expCount++;
      } catch {}
    }

    // 8. Ingest auxiliary entities
    for (const ds of bundle.datasets) {
      try {
        await repo.saveDataset(ds);
      } catch {}
    }

    for (const lin of bundle.lineages) {
      try {
        await repo.saveLineage(lin);
      } catch {}
    }

    for (const ret of bundle.retraction_alerts) {
      try {
        await repo.saveRetractionAlert(ret);
      } catch {}
    }

    for (const cd of bundle.cross_domain) {
      try {
        cd.session_id = targetSessionId;
        await repo.saveCrossDomain(cd);
      } catch {}
    }

    // Record evolution event for the import action
    try {
      await repo.saveEvolutionEvent({
        id: `evo_imp_${Math.random().toString(36).substring(2, 9)}`,
        session_id: targetSessionId,
        event_type: 'NEW_PUBLICATION_INGESTED',
        title: 'Research Archive Imported',
        description: `Restored ${paperCount} papers and ${claimCount} claims from portable archive.`,
        impact_summary: {
          new_claims_count: claimCount,
          evolution_delta: `Restored archive: ${action}`,
        },
        created_at: new Date().toISOString(),
      });
    } catch {}

    return {
      success: true,
      session_id: targetSessionId,
      action,
      title: bundle.session.title,
      imported_counts: {
        papers: paperCount,
        claims: claimCount,
        contexts: contextCount,
        relationships: relCount,
        gaps: gapCount,
        experiments: expCount,
      },
      warnings,
    };
  }
}

