'use client';

import React, { useState, useMemo } from 'react';
import { DomainSelector } from '@/components/DomainSelector';
import { SeedInput } from '@/components/SeedInput';
import { StudioInspector } from '@/components/StudioInspector';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { PromptViewer } from '@/components/PromptViewer';
import { DomainCheatsheet } from '@/components/DomainCheatsheet';
import { Sidebar } from '@/components/Sidebar';
import { getDomains } from '@/config/domains';
import {
  Question,
  UserAnswer,
  GenerateQuestionsResponse,
  Session,
  SessionRound,
  Attachment,
  PinnedAttributes,
  DeconstructMediaResponse,
} from '@/types/schemas';
import { sessionStore, useSessions } from '@/lib/storage';
import {
  Sparkles,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Sliders,
  Code,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { getDictionary, Locale, defaultLocale } from '@/i18n';

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = useMemo(() => getDictionary(locale), [locale]);
  const domains = useMemo(() => getDomains(t), [t]);

  const sessions = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0].id);
  const [seed, setSeed] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pinnedAttributes, setPinnedAttributes] = useState<PinnedAttributes>({});
  const [isDeconstructing, setIsDeconstructing] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isRefiningQuestions, setIsRefiningQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [analysis, setAnalysis] = useState<string | undefined>(undefined);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedMaster, setCopiedMaster] = useState<boolean>(false);

  // Prompt generation state
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'input' | 'questions' | 'prompt'>('input');
  const [currentRounds, setCurrentRounds] = useState<SessionRound[]>([]);

  const selectedDomainObj = useMemo(() => {
    return domains.find((d) => d.id === selectedDomainId) || domains[0];
  }, [domains, selectedDomainId]);

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  const handleCopyMaster = async () => {
    const textToCopy = generatedPrompt || seed;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    } catch (err) {
      console.error('Failed to copy master prompt:', err);
    }
  };

  const handleDeconstruct = async () => {
    if (attachments.length === 0) return;

    setError(null);
    setIsDeconstructing(true);

    try {
      const res = await fetch('/api/deconstruct-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments,
          seed: seed.trim() || undefined,
          domain: selectedDomainObj.name,
          locale,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: DeconstructMediaResponse = await res.json();
      if (data.seed) {
        setSeed(data.seed);
      }
      if (data.detectedAttributes) {
        setPinnedAttributes((prev) => ({
          ...prev,
          ...data.detectedAttributes,
        }));
      }
      if (data.suggestedDomain) {
        const matchingDomain = domains.find(
          (d) => d.id === data.suggestedDomain || d.name.toLowerCase().includes(data.suggestedDomain!.toLowerCase())
        );
        if (matchingDomain) {
          setSelectedDomainId(matchingDomain.id);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to deconstruct media attachments:', err);
      const msg = err instanceof Error ? err.message : t.app.fallbackError;
      setError(msg);
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!seed.trim() && attachments.length === 0) return;

    setError(null);
    setIsLoadingQuestions(true);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: seed.trim() || (locale === 'vi' ? 'Ý tưởng từ tệp đính kèm' : 'Idea from attachments'),
          domain: selectedDomainObj.name,
          pinnedAttributes: Object.keys(pinnedAttributes).length > 0 ? pinnedAttributes : undefined,
          attachments: attachments.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            size: a.size,
            textContent: a.textContent,
          })),
          locale,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: GenerateQuestionsResponse = await res.json();
      setQuestions(data.questions || []);
      setAnalysis(data.analysis);
      setAnswers([]);
      setCurrentStep('questions');
    } catch (err: unknown) {
      console.error('Failed to generate questions:', err);
      const msg = err instanceof Error ? err.message : t.app.fallbackError;
      setError(msg);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleKeepBuildingContext = async () => {
    if (!generatedPrompt) return;

    setError(null);
    setIsRefiningQuestions(true);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: seed.trim(),
          domain: selectedDomainObj.name,
          previousPrompt: generatedPrompt,
          previousQuestions: questions,
          previousAnswers: answers,
          pinnedAttributes: Object.keys(pinnedAttributes).length > 0 ? pinnedAttributes : undefined,
          attachments: attachments.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            size: a.size,
            textContent: a.textContent,
          })),
          locale,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: GenerateQuestionsResponse = await res.json();
      const newQuestions = data.questions || [];

      setQuestions((prev) => [...prev, ...newQuestions]);
      setAnalysis(data.analysis || (locale === 'vi' ? 'Đã tạo thêm tầng phân tích sâu hơn.' : 'Deeper refinement layer generated.'));
      setCurrentStep('questions');
    } catch (err: unknown) {
      console.error('Failed to refine questions:', err);
      const msg = err instanceof Error ? err.message : t.app.fallbackError;
      setError(msg);
    } finally {
      setIsRefiningQuestions(false);
    }
  };

  const handleAnswerChange = (updatedAnswer: UserAnswer) => {
    setAnswers((prev) => {
      const idx = prev.findIndex((a) => a.questionId === updatedAnswer.questionId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedAnswer;
        return copy;
      }
      return [...prev, updatedAnswer];
    });
  };

  const handleSetAllAiDecide = () => {
    setAnswers([]);
  };

  const handleResetAll = () => {
    setActiveSessionId(null);
    setQuestions([]);
    setAnalysis(undefined);
    setAnswers([]);
    setError(null);
    setGeneratedPrompt('');
    setSeed('');
    setAttachments([]);
    setPinnedAttributes({});
    setCurrentRounds([]);
    setCurrentStep('input');
  };

  const handleEditQuestions = () => {
    setCurrentStep('questions');
  };

  const handleSelectSession = (sessionId: string) => {
    const s = sessionStore.getSession(sessionId);
    if (!s) return;

    setActiveSessionId(s.id);
    setSelectedDomainId(s.domainId || domains[0].id);
    setSeed(s.seed);
    setCurrentRounds(s.rounds || []);

    const lastRound = s.rounds?.[s.rounds.length - 1];
    if (lastRound) {
      setQuestions(lastRound.questions || []);
      setAnswers(lastRound.answers || []);
      setAttachments(lastRound.attachments || []);
      setPinnedAttributes(lastRound.pinnedAttributes || {});
      setGeneratedPrompt(lastRound.prompt || '');
      setCurrentStep('prompt');
    } else {
      setAttachments([]);
      setPinnedAttributes({});
      setCurrentStep('input');
    }
    setError(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    sessionStore.deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      handleResetAll();
    }
  };

  const handleClearAllSessions = () => {
    sessionStore.clearSessions();
    handleResetAll();
  };

  const handleSubmitPromptGeneration = async () => {
    setIsGeneratingPrompt(true);
    setError(null);
    setGeneratedPrompt('');
    setCurrentStep('prompt');

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: seed.trim(),
          domain: selectedDomainObj.name,
          questions,
          answers,
          pinnedAttributes: Object.keys(pinnedAttributes).length > 0 ? pinnedAttributes : undefined,
          attachments: attachments.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            size: a.size,
            textContent: a.textContent,
          })),
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setGeneratedPrompt(accumulated);
      }

      // Save or update session in storage
      const newRound: SessionRound = {
        id: `r_${Date.now()}`,
        questions: [...questions],
        answers: [...answers],
        pinnedAttributes: Object.keys(pinnedAttributes).length > 0 ? pinnedAttributes : undefined,
        attachments: attachments.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          size: a.size,
          textContent: a.textContent,
        })),
        prompt: accumulated,
        createdAt: Date.now(),
      };

      const updatedRounds = [...currentRounds, newRound];
      setCurrentRounds(updatedRounds);

      const sessionId = activeSessionId || `sess_${Date.now()}`;
      const sessionTitle = seed.trim().slice(0, 40) + (seed.length > 40 ? '...' : '');

      const sessionData: Session = {
        id: sessionId,
        title: sessionTitle,
        domain: selectedDomainObj.name,
        domainId: selectedDomainObj.id,
        seed: seed.trim(),
        rounds: updatedRounds,
        createdAt: activeSessionId
          ? sessionStore.getSession(activeSessionId)?.createdAt || Date.now()
          : Date.now(),
        updatedAt: Date.now(),
      };

      sessionStore.saveSession(sessionData);
      setActiveSessionId(sessionId);
    } catch (err: unknown) {
      console.error('Error generating prompt:', err);
      const msg = err instanceof Error ? err.message : t.app.fallbackError;
      setError(msg);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const stats = useMemo(() => {
    const text = (generatedPrompt || seed).trim();
    if (!text) return { words: 0, chars: 0, tokens: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);
    return { words, chars, tokens };
  }, [generatedPrompt, seed]);

  return (
    <div className="h-screen bg-[#100E0D] text-[#EDE5DC] font-sans flex flex-col overflow-hidden">
      
      {/* 1. TOP HEADER: Option 2 Segmented Domain Switcher + Brand + Actions */}
      <header className="h-14 border-b border-[#2B2520] bg-[#161311] px-4 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-3">
          {/* Navigator Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            title={isSidebarOpen ? t.sidebar.closeTooltip : t.sidebar.openTooltip}
            className="rounded-md border border-[#38312C] bg-[#1E1917] p-1.5 text-[#B5A89B] hover:text-[#EDE5DC] hover:border-[#DA7756] cursor-pointer transition"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#DA7756] to-[#C15F3D] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-[#FBF9F5] hidden sm:inline">
              PromptGenerator
            </span>
          </div>
        </div>

        {/* Center: Option 2 Domain Segment Switcher */}
        <div className="overflow-x-auto py-1 scrollbar-none">
          <DomainSelector
            domains={domains}
            selectedDomainId={selectedDomainId}
            onSelectDomain={(domainId) => {
              setSelectedDomainId(domainId);
              setPinnedAttributes({});
            }}
            disabled={isLoadingQuestions || isGeneratingPrompt || isRefiningQuestions || isDeconstructing}
            t={t}
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#38312C] bg-[#1E1917] px-2.5 py-1 text-xs font-semibold text-[#B5A89B] hover:border-[#DA7756] hover:text-white cursor-pointer transition"
          >
            <Globe className="h-3.5 w-3.5 text-[#DA7756]" />
            <span className="uppercase font-bold">{locale}</span>
          </button>

          {/* Copy Master Button */}
          <button
            type="button"
            onClick={handleCopyMaster}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#DA7756] hover:bg-[#C15F3D] px-3 py-1 text-xs font-bold text-white shadow-xs cursor-pointer transition"
          >
            {copiedMaster ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedMaster ? (locale === 'vi' ? 'Đã chép!' : 'Copied!') : (locale === 'vi' ? 'Chép Master' : 'Copy Master')}</span>
          </button>

          {/* Inspector Toggle Button */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            title="Toggle Parameter Inspector"
            className="rounded-md border border-[#38312C] bg-[#1E1917] p-1.5 text-[#B5A89B] hover:text-[#EDE5DC] hover:border-[#DA7756] cursor-pointer transition"
          >
            {isInspectorOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANE STUDIO BODY */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Navigator (Session Tree & History) */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onSelectSession={handleSelectSession}
          onNewSession={handleResetAll}
          onDeleteSession={handleDeleteSession}
          onClearAll={handleClearAllSessions}
          t={t}
          currentLocale={locale}
        />

        {/* Center Main Workbench Pane */}
        <main
          className={`flex-1 flex flex-col bg-[#161311] min-w-0 transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-72 sm:md:ml-76' : 'ml-0'
          }`}
        >
          {/* Sub-Header Toolbar: View Tabs & Metrics */}
          <div className="h-10 border-b border-[#2B2520] px-4 flex items-center justify-between bg-[#191614] shrink-0 text-xs select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('questions')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition cursor-pointer ${
                  currentStep === 'questions'
                    ? 'bg-[#241F1C] text-[#DA7756] font-bold border border-[#38312C]'
                    : 'text-[#8E8377] hover:text-[#EDE5DC]'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{locale === 'vi' ? 'Bộ câu hỏi làm rõ' : 'Clarification Matrix'}</span>
                {questions.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#DA7756] animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (generatedPrompt) setCurrentStep('prompt');
                  else setCurrentStep('input');
                }}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition cursor-pointer ${
                  currentStep === 'prompt' || currentStep === 'input'
                    ? 'bg-[#241F1C] text-[#DA7756] font-bold border border-[#38312C]'
                    : 'text-[#8E8377] hover:text-[#EDE5DC]'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>{locale === 'vi' ? 'Không gian Master Prompt' : 'Master Prompt Studio'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#8E8377]">
              <span>Words: {stats.words}</span>
              <span>•</span>
              <span>Tokens: ~{stats.tokens}</span>
              <span>•</span>
              <span className="text-emerald-400">
                {currentStep === 'prompt'
                  ? 'Prompt Ready'
                  : currentStep === 'questions'
                  ? 'Clarification'
                  : 'Composer Ready'}
              </span>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="m-3 flex items-center gap-2.5 rounded-lg border border-red-900/50 bg-red-950/40 p-2.5 text-xs text-red-300 shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <div className="flex-1">
                <span className="font-semibold">{t.app.errorPrefix}: </span>
                {error}
              </div>
            </div>
          )}

          {/* Center Scrollable Work Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
            {/* Input State / Cheatsheet */}
            {currentStep === 'input' && (
              <section className="animate-in fade-in duration-150">
                <DomainCheatsheet
                  domain={selectedDomainObj}
                  onSelectExample={(example) => setSeed(example)}
                  locale={locale}
                  t={t}
                />
              </section>
            )}

            {/* Questions Step: Option 4 Clarification Matrix */}
            {currentStep === 'questions' && (
              <section className="rounded-xl border border-[#38312C] bg-[#1E1917] p-5 shadow-xl animate-in fade-in duration-150">
                <QuestionnaireForm
                  questions={questions}
                  analysis={analysis}
                  answers={answers}
                  onChangeAnswer={handleAnswerChange}
                  onSetAllAiDecide={handleSetAllAiDecide}
                  onSubmit={handleSubmitPromptGeneration}
                  onReset={handleResetAll}
                  isSubmitting={isGeneratingPrompt}
                  t={t}
                />
              </section>
            )}

            {/* Prompt Ready Step: Full Master Canvas */}
            {currentStep === 'prompt' && (
              <section className="animate-in fade-in duration-150">
                <PromptViewer
                  promptText={generatedPrompt}
                  domainName={selectedDomainObj.name}
                  isStreaming={isGeneratingPrompt}
                  roundNumber={currentRounds.length || 1}
                  onEditQuestions={handleEditQuestions}
                  onKeepBuilding={handleKeepBuildingContext}
                  onResetAll={handleResetAll}
                  onChangePrompt={(updated) => {
                    setGeneratedPrompt(updated);
                    if (activeSessionId) {
                      const s = sessionStore.getSession(activeSessionId);
                      if (s && s.rounds && s.rounds.length > 0) {
                        s.rounds[s.rounds.length - 1].prompt = updated;
                        s.updatedAt = Date.now();
                        sessionStore.saveSession(s);
                      }
                    }
                  }}
                  isRefining={isRefiningQuestions}
                  t={t}
                />
              </section>
            )}
          </div>

          {/* BOTTOM: Option 1 TALL Command Box */}
          <div className="p-3 bg-[#14110F] border-t border-[#2B2520] shrink-0">
            <SeedInput
              seed={seed}
              onChangeSeed={setSeed}
              selectedDomain={selectedDomainObj}
              pinnedAttributes={pinnedAttributes}
              onGenerateQuestions={handleGenerateQuestions}
              isLoading={isLoadingQuestions}
              disabled={isGeneratingPrompt || isRefiningQuestions}
              attachments={attachments}
              onChangeAttachments={setAttachments}
              onDeconstruct={handleDeconstruct}
              isDeconstructing={isDeconstructing}
              t={t}
            />
          </div>
        </main>

        {/* Right Pane: Option 3 Studio Inspector (Parameters + Cheatsheet) */}
        {isInspectorOpen && (
          <StudioInspector
            domain={selectedDomainObj}
            pinnedAttributes={pinnedAttributes}
            onChangePinnedAttributes={setPinnedAttributes}
            onAppendCheatKeyword={(kw) => {
              setSeed((prev) => (prev ? `${prev} ${kw}` : kw));
            }}
            disabled={isLoadingQuestions || isGeneratingPrompt || isRefiningQuestions || isDeconstructing}
            locale={locale}
            t={t}
          />
        )}

      </div>
    </div>
  );
}
