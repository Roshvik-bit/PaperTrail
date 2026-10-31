import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Search, CheckCircle2, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface InteractiveExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const InteractiveExplorerModal: React.FC<InteractiveExplorerModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'Impact of artificial intelligence on human learning'
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [stage, setStage] = useState<'input' | 'exploring' | 'completed'>('input');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const explorationSteps = [
    { title: 'Semantic Formulation', desc: 'Parsing hypothesis into multi-angle inquiry vectors...', progress: 20 },
    { title: 'Multi-Provider Scholarly Exploration', desc: 'Navigating OpenAlex, arXiv, Semantic Scholar, Crossref, and Zenodo...', progress: 45 },
    { title: 'Citation Traversal & Claim Grounding', desc: 'Following bi-directional citation chains across papers...', progress: 75 },
    { title: 'Contradiction & Gap Synthesis', desc: 'Isolating methodology divergence and formulating uncharted hypotheses...', progress: 95 },
  ];

  useEffect(() => {
    if (stage === 'exploring') {
      setCurrentStepIndex(0);
      const timer1 = setTimeout(() => setCurrentStepIndex(1), 800);
      const timer2 = setTimeout(() => setCurrentStepIndex(2), 1700);
      const timer3 = setTimeout(() => setCurrentStepIndex(3), 2600);
      const timerFinal = setTimeout(() => {
        setStage('completed');
      }, 3400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timerFinal);
      };
    }
  }, [stage]);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setStage('exploring');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252622]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl bg-[#FDFCF9] border border-[#E3E1D9] p-6 sm:p-8 shadow-paper-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#777873] hover:text-[#252622] hover:bg-[#FAF8F3] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-[#777873]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B96645]" />
          <span>PaperTrail Interactive Synthesis Sandbox</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#252622] mb-2">
          Experience Autonomous Intelligence
        </h3>
        <p className="text-xs sm:text-sm text-[#777873] font-sans mb-6">
          Simulate PaperTrail&apos;s 4-stage exploration pipeline to extract grounded claims and uncover candidate research frontiers.
        </p>

        {/* STAGE 1: INPUT */}
        {stage === 'input' && (
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#777873] mb-1.5 font-semibold">
                Research Inquiry or Hypothesis:
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#777873]" />
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#252622] placeholder-[#777873] focus:outline-none focus:border-[#252622] transition-colors resize-none leading-relaxed"
                  placeholder="Enter a scientific question, research paper title, or DOI..."
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#777873]">Sample Inquiries:</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {[
                  'Cognitive scaffolding and delayed memory recall decay',
                  'CRISPR-Cas9 off-target cleavage mechanisms across cell lineages',
                  'Room-temperature ambient pressure superconductivity boundary'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="px-2.5 py-1 rounded bg-[#FAF8F3] border border-[#E3E1D9] text-[#777873] hover:text-[#252622] hover:bg-[#EFECE5] transition-colors text-[11px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E3E1D9]">
              <span className="text-[11px] font-mono text-[#858B70]">
                Connected to OpenAlex, arXiv & Crossref
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#252622] text-[#FDFCF9] font-medium text-xs hover:bg-[#383A34] transition-all shadow-paper"
              >
                <span>Run Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STAGE 2: EXPLORING */}
        {stage === 'exploring' && (
          <div className="space-y-6 py-4">
            <div className="w-full bg-[#FAF8F3] rounded-full h-1.5 overflow-hidden border border-[#E3E1D9]">
              <div 
                className="bg-[#B96645] h-full transition-all duration-500 ease-out"
                style={{ width: `${explorationSteps[currentStepIndex].progress}%` }}
              />
            </div>

            <div className="space-y-3 font-mono text-xs">
              {explorationSteps.map((s, idx) => {
                const isCurrent = currentStepIndex === idx;
                const isDone = currentStepIndex > idx;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-[#FAF8F3] border-[#252622] text-[#252622]'
                        : isDone
                        ? 'bg-[#FAF8F3] border-[#858B70]/30 text-[#858B70]'
                        : 'bg-[#FDFCF9] border-[#E3E1D9] text-[#9D9E99]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#858B70]" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-[#B96645] animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-[#CCC8BC] inline-block" />
                        )}
                        <span className="font-semibold">{s.title}</span>
                      </div>
                      <span className="text-[10px] uppercase">{isDone ? 'COMPLETE' : (isCurrent ? 'ACTIVE' : 'QUEUED')}</span>
                    </div>
                    {isCurrent && (
                      <p className="mt-1 text-[11px] text-[#777873] font-sans pl-6">
                        {s.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 3: COMPLETED RESULTS */}
        {stage === 'completed' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#858B70] space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-xs text-[#858B70]">
                <span className="font-bold">SYNTHESIS SUCCESSFUL</span>
                <span className="text-[10px] text-[#777873]">Simulation Mode</span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#252622]">
                &ldquo;{topic}&rdquo;
              </h4>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <div className="font-serif text-2xl font-bold text-[#252622]">24</div>
                <div className="text-[10px] text-[#777873] mt-0.5">Papers Mapped</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <div className="font-serif text-2xl font-bold text-[#B96645]">5</div>
                <div className="text-[10px] text-[#777873] mt-0.5">Contradictions</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9]">
                <div className="font-serif text-2xl font-bold text-[#858B70]">3</div>
                <div className="text-[10px] text-[#777873] mt-0.5">Research Gaps</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FAF8F3] border border-[#E3E1D9] text-xs font-mono text-[#777873] space-y-1">
              <div className="font-bold text-[#252622]">Primary Surfaced Gap:</div>
              <p className="font-sans text-xs text-[#252622] leading-relaxed">
                &ldquo;Zero published controlled trials investigate whether mandatory forced retrieval questions before AI response generation preserves 60-day delayed recall.&rdquo;
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E1D9]">
              <button
                type="button"
                onClick={() => setStage('input')}
                className="text-xs font-mono text-[#777873] hover:text-[#252622] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Another Inquiry</span>
              </button>

              <Link
                href={`/workspace?q=${encodeURIComponent(topic)}`}
                className="px-5 py-2.5 rounded-full bg-[#252622] text-[#FDFCF9] font-medium text-xs hover:bg-[#383A34] transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EFECE5]" />
                <span>Open in Live Investigation Engine &rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
