'use client';

import React, { useState, useMemo } from 'react';
import { DomainSelector } from '@/components/DomainSelector';
import { SeedInput } from '@/components/SeedInput';
import { PinnedAttributesSelector } from '@/components/PinnedAttributesSelector';
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
  PlusCircle,
  FileCode2,
} from 'lucide-react';
import { getDictionary, Locale, defaultLocale } from '@/i18n';

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = useMemo(() => getDictionary(locale), [locale]);
  const domains = useMemo(() => getDomains(t), [t]);

  const sessions = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // Default show sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2B2520] dark:bg-[#191614] dark:text-[#EDE5DC] font-sans flex">
      {/* Sidebar Component */}
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

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-72 sm:md:ml-76' : 'ml-0'
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-[#E6DFD3]/80 bg-[#FBF9F5]/90 backdrop-blur-md dark:border-[#38312C]/80 dark:bg-[#191614]/90">
          <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) items-center justify-between px-4 py-2.5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                title={isSidebarOpen ? t.sidebar.closeTooltip : t.sidebar.openTooltip}
                className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-1.5 text-[#6B6258] hover:bg-[#F3EFE6] hover:text-[#2B2520] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:bg-[#2E2723] dark:hover:text-white cursor-pointer transition"
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C15F3D] text-white shadow-xs dark:bg-[#DA7756]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-[#2B2520] dark:text-[#EDE5DC]">{t.app.title}</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Quick Reset / New Prompt */}
              <button
                type="button"
                onClick={handleResetAll}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#6B6258] shadow-2xs hover:border-[#C15F3D]/50 hover:bg-[#FDF6F0] hover:text-[#C15F3D] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:border-[#DA7756]/50 dark:hover:bg-[#33231D] dark:hover:text-[#DA7756] cursor-pointer transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{locale === 'vi' ? 'Tạo mới' : 'New Prompt'}</span>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLocale}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#6B6258] shadow-2xs hover:bg-[#F3EFE6] hover:text-[#2B2520] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:bg-[#2E2723] dark:hover:text-white cursor-pointer transition"
              >
                <Globe className="h-3.5 w-3.5 text-[#C15F3D] dark:text-[#DA7756]" />
                <span className="uppercase font-bold">{locale}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <main className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-4 sm:px-8 flex-1 flex flex-col">
          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-md border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">{t.app.errorPrefix}: </span>
                {error}
              </div>
            </div>
          )}

          {/* Studio Workspace: 2-Column Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-5 flex-1 items-start">
            {/* Left Pane: Composer & Domain Controls (42% width) */}
            <div className="w-full lg:w-[480px] lg:max-w-[500px] shrink-0 space-y-3.5 lg:sticky lg:top-16">
              {/* Step 1: Pill Domain Selector */}
              <section className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3 shadow-2xs dark:border-[#38312C] dark:bg-[#282320]">
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
              </section>

              {/* Step 2: Pinned Domain Attributes (Aspect Ratio, Resolution, Motion, Camera) */}
              <PinnedAttributesSelector
                domainId={selectedDomainId}
                value={pinnedAttributes}
                onChange={setPinnedAttributes}
                disabled={isLoadingQuestions || isGeneratingPrompt || isRefiningQuestions || isDeconstructing}
                t={t}
              />

              {/* Step 3: Integrated Seed Input & Dropzone */}
              <section className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-3.5 shadow-2xs dark:border-[#38312C] dark:bg-[#282320]">
                <SeedInput
                  seed={seed}
                  onChangeSeed={setSeed}
                  selectedDomain={selectedDomainObj}
                  onGenerateQuestions={handleGenerateQuestions}
                  isLoading={isLoadingQuestions}
                  disabled={isGeneratingPrompt || isRefiningQuestions}
                  attachments={attachments}
                  onChangeAttachments={setAttachments}
                  onDeconstruct={handleDeconstruct}
                  isDeconstructing={isDeconstructing}
                  t={t}
                />
              </section>
            </div>

            {/* Right Pane: Interactive Output Studio & Cheatsheet (58% width) */}
            <div className="flex-1 w-full min-w-0 flex flex-col min-h-[500px]">
              {/* Initial State: Rich Domain Parameter Guide & 1-Click Starters */}
              {currentStep === 'input' && (
                <section className="animate-in fade-in duration-200">
                  <DomainCheatsheet
                    domain={selectedDomainObj}
                    onSelectExample={(example) => setSeed(example)}
                    locale={locale}
                    t={t}
                  />
                </section>
              )}

              {/* Questions State: Interactive Questionnaire Form */}
              {currentStep === 'questions' && questions.length > 0 && (
                <section className="rounded-lg border border-[#E6DFD3] bg-[#FFFFFF] p-5 shadow-2xs dark:border-[#38312C] dark:bg-[#282320] animate-in fade-in duration-200">
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

              {/* Prompt Ready State: Full Master Canvas */}
              {currentStep === 'prompt' && (
                <section className="animate-in fade-in duration-200">
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
          </div>
        </main>
      </div>
    </div>
  );
}
