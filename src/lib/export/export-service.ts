// =====================================================================
// PAPERTRAIL RESEARCH EXPORT ENGINE
// Generates complete ZIP archives, JSON, Markdown, CSV, BibTeX and HTML briefs
// =====================================================================

import { ResearchBundle, ResearchExportFormat, Paper, Claim, ProposedExperiment } from '@/types';
import { createZipArchive, ZipFileInput } from './zip-utils';

export class ResearchExportService {
  /**
   * Main export dispatcher by format
   */
  static exportBundle(
    bundle: ResearchBundle,
    format: ResearchExportFormat = 'zip'
  ): { filename: string; mimeType: string; data: Buffer | string } {
    const slug = (bundle.session.title || 'research')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40);

    const timestamp = new Date().toISOString().slice(0, 10);

    switch (format) {
      case 'zip':
        return {
          filename: `papertrail-${slug}-${timestamp}.zip`,
          mimeType: 'application/zip',
          data: this.generateZipArchive(bundle),
        };
      case 'json':
        return {
          filename: `papertrail-${slug}-${timestamp}.json`,
          mimeType: 'application/json',
          data: JSON.stringify(bundle, null, 2),
        };
      case 'markdown':
        return {
          filename: `papertrail-${slug}-${timestamp}.md`,
          mimeType: 'text/markdown; charset=utf-8',
          data: this.generateMonolithicMarkdown(bundle),
        };
      case 'bibtex':
        return {
          filename: `papertrail-${slug}-${timestamp}.bib`,
          mimeType: 'application/x-bibtex; charset=utf-8',
          data: this.generateBibtex(bundle.papers),
        };
      case 'csv':
        return {
          filename: `papertrail-${slug}-papers-${timestamp}.csv`,
          mimeType: 'text/csv; charset=utf-8',
          data: this.generatePapersCsv(bundle.papers),
        };
      case 'html':
        return {
          filename: `papertrail-${slug}-brief-${timestamp}.html`,
          mimeType: 'text/html; charset=utf-8',
          data: this.generatePrintableHtml(bundle),
        };
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Creates an organized, hierarchical ZIP archive matching the specification:
   * papertrail-research/
   *   manifest.json
   *   README.md
   *   papers/
   *   claims/
   *   evidence/
   *   graph/
   *   research-gaps/
   *   experiments/
   *   datasets/
   *   timeline/
   *   reports/
   *   provenance/
   */
  static generateZipArchive(bundle: ResearchBundle): Buffer {
    const files: ZipFileInput[] = [];
    const prefix = 'papertrail-research';

    // 1. Manifest
    files.push({
      path: `${prefix}/manifest.json`,
      content: JSON.stringify(bundle.manifest, null, 2),
    });

    // 2. README.md
    files.push({
      path: `${prefix}/README.md`,
      content: this.generateReadme(bundle),
    });

    // 3. Papers folder
    // Sanitize papers: omit proprietary or copyrighted raw_full_text
    const sanitizedPapers = bundle.papers.map(p => {
      const { raw_full_text, ...safe } = p;
      return safe;
    });

    files.push({
      path: `${prefix}/papers/papers.json`,
      content: JSON.stringify(sanitizedPapers, null, 2),
    });

    files.push({
      path: `${prefix}/papers/papers.csv`,
      content: this.generatePapersCsv(bundle.papers),
    });

    // Individual markdown dossier per paper
    for (const paper of bundle.papers) {
      const cleanId = paper.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      files.push({
        path: `${prefix}/papers/${cleanId}.md`,
        content: this.generatePaperMarkdown(paper, bundle.claims.filter(c => c.paper_id === paper.id)),
      });
    }

    // 4. Claims folder
    files.push({
      path: `${prefix}/claims/claims.json`,
      content: JSON.stringify(bundle.claims, null, 2),
    });
    files.push({
      path: `${prefix}/claims/claims.csv`,
      content: this.generateClaimsCsv(bundle.claims),
    });

    // 5. Evidence folder
    files.push({
      path: `${prefix}/evidence/evidence_relationships.json`,
      content: JSON.stringify(bundle.relationships, null, 2),
    });
    files.push({
      path: `${prefix}/evidence/disagreements.md`,
      content: this.generateDisagreementsMarkdown(bundle),
    });

    // 6. Graph folder
    files.push({
      path: `${prefix}/graph/evidence_graph.json`,
      content: JSON.stringify(this.generateGraphPayload(bundle), null, 2),
    });

    // 7. Research-Gaps folder
    files.push({
      path: `${prefix}/research-gaps/gaps.json`,
      content: JSON.stringify(bundle.gaps, null, 2),
    });
    files.push({
      path: `${prefix}/research-gaps/falsification_reports.json`,
      content: JSON.stringify(bundle.investigations, null, 2),
    });
    files.push({
      path: `${prefix}/research-gaps/gaps_and_falsifications.md`,
      content: this.generateGapsMarkdown(bundle),
    });

    // 8. Experiments folder
    files.push({
      path: `${prefix}/experiments/experiments.json`,
      content: JSON.stringify(bundle.experiments, null, 2),
    });
    files.push({
      path: `${prefix}/experiments/protocols.md`,
      content: this.generateExperimentsMarkdown(bundle.experiments),
    });

    // 9. Datasets folder
    files.push({
      path: `${prefix}/datasets/datasets.json`,
      content: JSON.stringify(bundle.datasets, null, 2),
    });
    files.push({
      path: `${prefix}/datasets/datasets.csv`,
      content: this.generateDatasetsCsv(bundle.datasets),
    });

    // 10. Timeline folder
    files.push({
      path: `${prefix}/timeline/evolution_timeline.json`,
      content: JSON.stringify(bundle.evolution_events, null, 2),
    });
    files.push({
      path: `${prefix}/timeline/timeline.md`,
      content: this.generateTimelineMarkdown(bundle.evolution_events),
    });

    // 11. Reports folder
    files.push({
      path: `${prefix}/reports/research_brief.md`,
      content: this.generateMonolithicMarkdown(bundle),
    });
    files.push({
      path: `${prefix}/reports/research_brief.html`,
      content: this.generatePrintableHtml(bundle),
    });

    // 12. Provenance folder
    files.push({
      path: `${prefix}/provenance/lineage.json`,
      content: JSON.stringify(bundle.lineages, null, 2),
    });
    files.push({
      path: `${prefix}/provenance/retraction_alerts.json`,
      content: JSON.stringify(bundle.retraction_alerts, null, 2),
    });
    files.push({
      path: `${prefix}/provenance/cross_domain.json`,
      content: JSON.stringify(bundle.cross_domain, null, 2),
    });

    return createZipArchive(files);
  }

  // --- MARKDOWN GENERATORS ---

  static generateReadme(bundle: ResearchBundle): string {
    return `# PaperTrail Scientific Investigation Archive
**Title:** ${bundle.session.title}  
**Research Question:** ${bundle.session.research_question}  
**Domain:** ${bundle.session.domain}  
**Export Date:** ${bundle.manifest.exported_at}  
**Schema Version:** ${bundle.manifest.format_version}  

---

## Executive Summary
This portable research archive was generated by **PaperTrail**, the evidence-driven scientific intelligence engine.
All extracted claims preserve exact supporting passages, experimental conditions, hardware profiles, and paper citations.

### Summary Metrics
- **Landmark Papers Analyzed:** ${bundle.papers.length}
- **Extracted Grounded Claims:** ${bundle.claims.length}
- **Evidence Relationships Mapped:** ${bundle.relationships.length}
- **Candidate Research Gaps Identified:** ${bundle.gaps.length}
- **Feasible Experiment Protocols Planned:** ${bundle.experiments.length}
- **Benchmark Datasets Discovered:** ${bundle.datasets.length}
- **Preprint-to-Publication Lineages:** ${bundle.lineages.length}
- **Retraction / Correction Alerts:** ${bundle.retraction_alerts.length}
- **Evolution Timeline Events:** ${bundle.evolution_events.length}

---

## Folder Structure
- \`manifest.json\`: Verification manifest with schema version and checksums.
- \`papers/\`: Canonical paper metadata, CSV index, and individual markdown dossiers.
- \`claims/\`: Structured scientific claims with verbatim supporting passages.
- \`evidence/\`: Context-aware claim comparisons resolving apparent vs genuine conflicts.
- \`graph/\`: Formatted nodes and edges for network and citation visualization.
- \`research-gaps/\`: 6-stage adversarial falsification audit results.
- \`experiments/\`: Actionable protocols, hardware requirements, and cost estimates.
- \`datasets/\`: Discovered benchmark datasets with license verification.
- \`timeline/\`: Temporal chronology of how scientific conclusions evolved.
- \`reports/\`: Monolithic research brief and printable HTML report.
- \`provenance/\`: Preprint lineages, retraction warnings, and cross-domain transfers.
`;
  }

  static generatePaperMarkdown(paper: Paper, claims: Claim[]): string {
    const authors = (paper.authors || []).map(a => a.name).join(', ') || 'Unknown Authors';
    return `# ${paper.title}

- **Authors:** ${authors}
- **Year:** ${paper.year || 'N/A'} | **Venue:** ${paper.venue || 'N/A'}
- **DOI:** ${paper.doi ? `[${paper.doi}](https://doi.org/${paper.doi})` : 'N/A'}
- **arXiv:** ${paper.arxiv_id ? `[arXiv:${paper.arxiv_id}](https://arxiv.org/abs/${paper.arxiv_id})` : 'N/A'}
- **Open Access:** ${paper.open_access_status} | **Citations:** ${paper.citation_count || 0}
${paper.is_retracted ? `\n> ⚠️ **PROVENANCE WARNING:** This publication has a formal retraction or correction alert on record.\n` : ''}

## Abstract
${paper.abstract}

## Grounded Claims Extracted (${claims.length})
${claims.map((c, i) => `### Claim ${i + 1}: ${c.claim_type} (${Math.round(c.extraction_confidence * 100)}% Confidence)
> "${c.claim_text}"

- **Section:** ${c.section || 'General'}
- **Supporting Passage:** *" ${c.supporting_passage} "*
- **Verification Status:** \`${c.verification_status}\`
`).join('\n')}
`;
  }

  static generateDisagreementsMarkdown(bundle: ResearchBundle): string {
    return `# Context-Aware Scientific Disagreement Analysis
PaperTrail compares findings within their precise experimental contexts (hardware architecture, quantization precision, thermal state, and benchmark datasets) to separate apparent contradictions from genuine scientific conflicts.

${bundle.relationships.map((rel, i) => {
  const source = bundle.claims.find(c => c.id === rel.source_claim_id);
  const target = bundle.claims.find(c => c.id === rel.target_claim_id);
  return `## Relationship ${i + 1}: \`${rel.relationship_type}\` (${Math.round(rel.confidence * 100)}% Confidence)

- **Claim A:** "${source?.claim_text || rel.source_claim_id}"
- **Claim B:** "${target?.claim_text || rel.target_claim_id}"
- **Evaluation:** ${rel.supporting_evidence}

${rel.context_comparison ? `\`\`\`json
${JSON.stringify(rel.context_comparison, null, 2)}
\`\`\`` : ''}

---
`;
}).join('\n')}
`;
  }

  static generateGapsMarkdown(bundle: ResearchBundle): string {
    return `# Candidate Research Gaps & Adversarial Falsification Audits
Every proposed gap is subjected to a 6-stage counter-evidence investigation across independent scholarly registries before being retained.

${bundle.gaps.map((gap, i) => {
  const investigation = bundle.investigations.find(inv => inv.research_gap_id === gap.id);
  return `## Gap ${i + 1}: ${gap.title}
- **Type:** \`${gap.gap_type}\`
- **Status:** \`${gap.status}\` (${Math.round(gap.confidence * 100)}% Confidence)
- **Research Question:** *${gap.research_question}*

### Description
${gap.description}

${gap.coverage_summary ? `### Coverage Summary\n${gap.coverage_summary}\n` : ''}

${investigation ? `### 6-Stage Falsification Audit Log
- **Final Outcome:** \`${investigation.outcome}\`
- **Reasoning:** ${investigation.reasoning_summary}
- **Coverage Limitations:** ${investigation.coverage_limitations}
- **Search Queries Audited:** ${investigation.search_queries.join(', ')}
` : ''}

---
`;
}).join('\n')}
`;
  }

  static generateExperimentsMarkdown(experiments: ProposedExperiment[]): string {
    return `# Actionable Experiment Protocols & Feasibility Evaluations
Concrete, resource-evaluated scientific test protocols designed to resolve verified candidate gaps.

${experiments.map((exp, i) => `## Protocol ${i + 1}: ${exp.objective}
- **Hypothesis:** ${exp.testable_hypothesis}
- **Methodology:** ${exp.methodology}

### Variables
- **Independent:** ${(exp.variables as any)?.independent?.join(', ') || 'N/A'}
- **Dependent:** ${(exp.variables as any)?.dependent?.join(', ') || 'N/A'}
- **Controlled:** ${(exp.variables as any)?.controlled?.join(', ') || 'N/A'}

### Resource & Feasibility Estimation
\`\`\`json
${JSON.stringify(exp.estimated_resources, null, 2)}
\`\`\`

### Verification Checklist
${((exp.checklist as any[]) || []).map(item => `- [${item.completed ? 'x' : ' '}] ${item.item}`).join('\n')}

---
`).join('\n')}
`;
  }

  static generateTimelineMarkdown(events: ResearchBundle['evolution_events']): string {
    return `# Evidence Evolution Chronology
Chronological log of newly ingested research, preprint shifts, retraction detections, and gap status updates.

${events.map((ev, i) => `### ${i + 1}. [${new Date(ev.created_at).toLocaleDateString()}] ${ev.title}
- **Event Type:** \`${ev.event_type}\`
- **Description:** ${ev.description}
${ev.impact_summary ? `- **Impact:** ${JSON.stringify(ev.impact_summary)}` : ''}
`).join('\n')}
`;
  }

  static generateMonolithicMarkdown(bundle: ResearchBundle): string {
    return `# PaperTrail Scientific Research Brief
# ${bundle.session.title}

- **Core Question:** ${bundle.session.research_question}
- **Domain Focus:** ${bundle.session.domain}
- **Export Timestamp:** ${bundle.manifest.exported_at}
- **Analysis Engine:** PaperTrail v${bundle.manifest.app_version}

---

## 1. Landmark Literature (${bundle.papers.length} Papers)
${bundle.papers.map(p => `### ${p.title} (${p.year || 'n.d.'})
- **Authors:** ${(p.authors || []).map(a => a.name).join(', ')}
- **Venue:** ${p.venue || 'arXiv'} | **DOI:** ${p.doi || 'N/A'}
- **Abstract Summary:** ${p.abstract.slice(0, 350)}...
`).join('\n')}

---

## 2. Evidence Map & Disagreements (${bundle.relationships.length} Relationships)
${bundle.relationships.map(r => `- **[${r.relationship_type}]**: ${r.supporting_evidence}`).join('\n')}

---

## 3. Retained Candidate Research Gaps (${bundle.gaps.length} Gaps)
${bundle.gaps.map(g => `### ${g.title} [\`${g.status}\`]
- **Question:** ${g.research_question}
- **Description:** ${g.description}
`).join('\n')}

---

## 4. Planned Feasibility Experiments (${bundle.experiments.length} Protocols)
${bundle.experiments.map(e => `### ${e.objective}
- **Hypothesis:** ${e.testable_hypothesis}
- **Methodology:** ${e.methodology}
`).join('\n')}
`;
  }

  // --- BIBTEX GENERATOR ---

  static generateBibtex(papers: Paper[]): string {
    return papers.map(p => {
      const firstAuthor = (p.authors?.[0]?.name || 'unknown').split(' ').pop()?.toLowerCase() || 'author';
      const year = p.year || 2024;
      const key = `${firstAuthor}${year}_${p.id.slice(0, 8)}`;
      const authorsStr = (p.authors || []).map(a => a.name).join(' and ');

      return `@article{${key},
  title = {${p.title.replace(/[{}\\]/g, '')}},
  author = {${authorsStr}},
  year = {${year}},
  journal = {${p.venue || 'arXiv preprint'}},
  ${p.doi ? `doi = {${p.doi}},` : ''}
  ${p.arxiv_id ? `eprint = {${p.arxiv_id}}, archivePrefix = {arXiv},` : ''}
  ${p.canonical_url ? `url = {${p.canonical_url}},` : ''}
}`;
    }).join('\n\n');
  }

  // --- CSV GENERATORS ---

  static generatePapersCsv(papers: Paper[]): string {
    const headers = ['id', 'title', 'year', 'venue', 'doi', 'arxiv_id', 'open_access_status', 'citation_count', 'authors'];
    const rows = papers.map(p => [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.year || '',
      `"${(p.venue || '').replace(/"/g, '""')}"`,
      p.doi || '',
      p.arxiv_id || '',
      p.open_access_status,
      p.citation_count || 0,
      `"${((p.authors || []).map(a => a.name).join('; ')).replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static generateClaimsCsv(claims: Claim[]): string {
    const headers = ['id', 'paper_id', 'claim_type', 'claim_text', 'section', 'supporting_passage', 'extraction_confidence', 'verification_status'];
    const rows = claims.map(c => [
      c.id,
      c.paper_id,
      c.claim_type,
      `"${(c.claim_text || '').replace(/"/g, '""')}"`,
      `"${(c.section || '').replace(/"/g, '""')}"`,
      `"${(c.supporting_passage || '').replace(/"/g, '""')}"`,
      c.extraction_confidence,
      c.verification_status,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static generateDatasetsCsv(datasets: ResearchBundle['datasets']): string {
    const headers = ['id', 'title', 'source_repository', 'license', 'availability', 'access_url'];
    const rows = datasets.map(d => [
      d.id,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      d.source_repository,
      d.license || 'Unknown',
      d.availability,
      d.access_url,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // --- GRAPH GENERATOR ---

  static generateGraphPayload(bundle: ResearchBundle): { nodes: any[]; edges: any[] } {
    const nodes = [
      ...bundle.papers.map(p => ({ id: p.id, type: 'paper', data: { label: p.title, year: p.year } })),
      ...bundle.claims.map(c => ({ id: c.id, type: 'claim', data: { label: c.claim_text.slice(0, 60), type: c.claim_type } })),
      ...bundle.gaps.map(g => ({ id: g.id, type: 'gap', data: { label: g.title, status: g.status } })),
    ];

    const edges = [
      ...bundle.claims.map(c => ({ id: `edge_${c.id}_${c.paper_id}`, source: c.paper_id, target: c.id, label: 'ASSERTS' })),
      ...bundle.relationships.map(r => ({ id: r.id, source: r.source_claim_id, target: r.target_claim_id, label: r.relationship_type })),
    ];

    return { nodes, edges };
  }

  // --- PRINTABLE HTML GENERATOR ---

  static generatePrintableHtml(bundle: ResearchBundle): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PaperTrail Executive Brief: ${bundle.session.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    h2 { color: #1e3a8a; margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    h3 { color: #2563eb; margin-top: 20px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 16px; color: #475569; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
      Print / Save to PDF
    </button>
  </div>

  <h1>PaperTrail Scientific Research Brief</h1>
  <p><strong>Investigation Question:</strong> ${bundle.session.research_question}</p>
  <p><strong>Domain:</strong> ${bundle.session.domain} | <strong>Generated:</strong> ${bundle.manifest.exported_at}</p>

  <h2>1. Summary Statistics</h2>
  <table>
    <tr><th>Analyzed Papers</th><td>${bundle.papers.length}</td></tr>
    <tr><th>Extracted Claims</th><td>${bundle.claims.length}</td></tr>
    <tr><th>Disagreements & Evidence Edges</th><td>${bundle.relationships.length}</td></tr>
    <tr><th>Validated Candidate Gaps</th><td>${bundle.gaps.length}</td></tr>
    <tr><th>Planned Protocols</th><td>${bundle.experiments.length}</td></tr>
  </table>

  <h2>2. Candidate Research Gaps</h2>
  ${bundle.gaps.map(g => `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">${g.title}</h3>
        <span class="badge">${g.status}</span>
      </div>
      <p><strong>Research Question:</strong> ${g.research_question}</p>
      <p>${g.description}</p>
    </div>
  `).join('')}

  <h2>3. Actionable Experiment Protocols</h2>
  ${bundle.experiments.map(e => `
    <div class="card">
      <h3 style="margin: 0 0 8px 0;">${e.objective}</h3>
      <p><strong>Hypothesis:</strong> ${e.testable_hypothesis}</p>
      <p><strong>Methodology:</strong> ${e.methodology}</p>
    </div>
  `).join('')}

  <h2>4. Analyzed Literature References</h2>
  ${bundle.papers.map(p => `
    <div style="margin-bottom: 12px;">
      <strong>${p.title}</strong> (${p.year || 'n.d.'})<br>
      <span style="color: #64748b; font-size: 14px;">${(p.authors || []).map(a => a.name).join(', ')} — ${p.venue || 'arXiv'}</span>
    </div>
  `).join('')}
</body>
</html>`;
  }
}
