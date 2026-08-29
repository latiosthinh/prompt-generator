'use client';

import React from 'react';
import { DomainConfig } from '@/config/domains';
import { Translations } from '@/i18n';
import {
  Sparkles,
  Camera,
  Code2,
  PenTool,
  Bot,
  Sliders,
  Layers,
  ArrowUpRight,
  Video,
} from 'lucide-react';

interface DomainCheatsheetProps {
  domain: DomainConfig;
  onSelectExample: (example: string) => void;
  locale: string;
  t: Translations;
}

export function DomainCheatsheet({
  domain,
  onSelectExample,
  locale,
  t,
}: DomainCheatsheetProps) {
  const isVi = locale === 'vi';

  const renderCheatsheetContent = () => {
    switch (domain.id) {
      case 'image-generation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Thông số Midjourney phổ biến' : 'Common Midjourney Parameters'}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] font-mono text-[#6B6258] dark:text-[#B5A89B]">
                  <div><span className="text-[#2B2520] dark:text-[#EDE5DC] font-bold">--ar 16:9</span>: {isVi ? 'Khung ngang điện ảnh' : 'Landscape widescreen'}</div>
                  <div><span className="text-[#2B2520] dark:text-[#EDE5DC] font-bold">--ar 9:16</span>: {isVi ? 'Khung dọc Story / Reels' : 'Portrait / TikTok'}</div>
                  <div><span className="text-[#2B2520] dark:text-[#EDE5DC] font-bold">--stylize 250</span>: {isVi ? 'Mức độ nghệ thuật hóa' : 'Stylization intensity'}</div>
                  <div><span className="text-[#2B2520] dark:text-[#EDE5DC] font-bold">--chaos 10</span>: {isVi ? 'Độ biến thiên sáng tạo' : 'Creativity variance'}</div>
                </div>
              </div>

              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Camera className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Từ khóa Ánh sáng & Camera' : 'Lighting & Optics Vocabulary'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'Volumetric lighting',
                    'Golden hour',
                    'Cinematic 35mm lens',
                    'Macro shot',
                    'Octane render 8k',
                    'Unreal Engine 5',
                    'Rim lighting',
                  ].map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] text-[#6B6258] dark:bg-[#1F1A18] dark:text-[#B5A89B]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'video-generation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Video className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Quỹ đạo Camera Điện ảnh' : 'Cinematic Camera Motions'}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-[#6B6258] dark:text-[#B5A89B]">
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">FPV Drone Fly-through:</strong> {isVi ? 'Góc lượn không người lái tốc độ cao' : 'High-speed immersive dive'}</div>
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">360° Orbit:</strong> {isVi ? 'Xoay tròn 360 độ quanh chủ thể' : 'Continuous orbital rotation'}</div>
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">Dolly Zoom / Vertigo:</strong> {isVi ? 'Hiệu ứng zoom đối nghịch' : 'Opposing zoom focal effect'}</div>
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">Tracking Follow:</strong> {isVi ? 'Bám đuổi theo hành động' : 'Dynamic subject pursuit'}</div>
                </div>
              </div>

              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Tương thích Engine Video AI' : 'Video Engine Compatibility'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'Runway Gen-3 Alpha',
                    'OpenAI Sora',
                    'Kling 1.5 HD',
                    'Luma Dream Machine',
                    'Pika 2.0',
                    '24fps Cinematic Motion',
                    'Slow-motion 60fps',
                  ].map((engine) => (
                    <span
                      key={engine}
                      className="rounded bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] text-[#6B6258] dark:bg-[#1F1A18] dark:text-[#B5A89B]"
                    >
                      {engine}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'coding-tech':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Cấu trúc Prompt Lập trình Chuẩn' : 'Production Coding Prompt Pillars'}</span>
                </div>
                <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-[#6B6258] dark:text-[#B5A89B]">
                  <li>{isVi ? 'Xác định vai trò & Tech Stack phiên bản cụ thể' : 'Explicit Role & exact versioned tech stack'}</li>
                  <li>{isVi ? 'Ràng buộc kiểu dữ liệu & schema nghiêm ngặt' : 'Strict types, Zod/DTO contracts'}</li>
                  <li>{isVi ? 'Chiến lược xử lý lỗi & logging biên giới' : 'Edge error handling & boundary logging'}</li>
                  <li>{isVi ? 'Bộ test case & nguyên lý TDD / Clean Code' : 'Runnable test harnesses & zero-fluff output'}</li>
                </ul>
              </div>

              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Gợi ý Ràng buộc kỹ thuật' : 'Technical Constraint Keywords'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'TypeScript Strict',
                    'Zero Runtime Exceptions',
                    'Next.js App Router',
                    'Tailwind v4',
                    'PostgreSQL Indexing',
                    'Idempotent API',
                    'Atomic Operations',
                  ].map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] text-[#6B6258] dark:bg-[#1F1A18] dark:text-[#B5A89B]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'creative-writing':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <PenTool className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Công thức Copywriting Đỉnh cao' : 'High-Impact Copy Frameworks'}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-[#6B6258] dark:text-[#B5A89B]">
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">PAS:</strong> Problem &rarr; Agitate &rarr; Solution</div>
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">AIDA:</strong> Attention &rarr; Interest &rarr; Desire &rarr; Action</div>
                  <div><strong className="text-[#2B2520] dark:text-[#EDE5DC]">StoryBrand:</strong> Hero &rarr; Villain &rarr; Guide &rarr; Plan</div>
                </div>
              </div>

              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Tone & Giọng điệu Phù hợp' : 'Tone & Voice Registers'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'Punchy & Authoritative',
                    'Socratic & Analytical',
                    'Witty & Provocative',
                    'Empathetic Storytelling',
                    'High-conversion B2B',
                  ].map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] text-[#6B6258] dark:bg-[#1F1A18] dark:text-[#B5A89B]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'agents-system':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Bot className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Cấu phần System Prompt Agent' : 'System Prompt Architecture'}</span>
                </div>
                <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-[#6B6258] dark:text-[#B5A89B]">
                  <li>{isVi ? 'Định danh vai trò & Giới hạn thẩm quyền' : 'Core Identity & Scope Boundaries'}</li>
                  <li>{isVi ? 'Quy chuẩn gọi công cụ & JSON schema' : 'Tool invocation contracts & JSON schemas'}</li>
                  <li>{isVi ? 'Quy tắc an toàn & xử lý câu hỏi ngoại lệ' : 'Safety guardrails & fallback handlers'}</li>
                  <li>{isVi ? 'Checklist tự kiểm tra trước khi phản hồi' : 'Pre-flight self-verification checklist'}</li>
                </ul>
              </div>

              <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-3 dark:border-[#38312C] dark:bg-[#282320]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C15F3D] dark:text-[#DA7756]">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Cơ chế Suy luận Agent' : 'Agent Reasoning Loops'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'ReAct Loop',
                    'Chain-of-Thought Guarded',
                    'Strict JSON Schema',
                    'Tool Call Retry Backoff',
                    'Deterministic Output',
                  ].map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-[#F5F0E6] px-1.5 py-0.5 text-[10px] text-[#6B6258] dark:bg-[#1F1A18] dark:text-[#B5A89B]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-4 text-xs text-[#6B6258] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B]">
            <p className="font-medium text-[#2B2520] dark:text-[#EDE5DC]">
              {isVi
                ? 'Kỹ nghệ Prompt Tùy chỉnh & Đa năng'
                : 'General Multi-Purpose Prompt Engineering'}
            </p>
            <p className="mt-1 leading-relaxed">
              {isVi
                ? 'Hỗ trợ cấu trúc hóa mọi yêu cầu phân tích, thảo luận chiến lược, tóm tắt dữ liệu hoặc giải quyết bài toán phức tạp theo tiêu chuẩn quốc tế.'
                : 'Structure any analytical, reasoning, research, or executive synthesis task into unambiguous, high-yield LLM prompts.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 rounded-lg border border-[#E6DFD3] bg-[#FDFCF9] p-5 shadow-2xs dark:border-[#38312C] dark:bg-[#1F1A18]">
      <div className="flex items-center justify-between border-b border-[#E6DFD3]/80 pb-3 dark:border-[#38312C]/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C15F3D]/10 text-[#C15F3D] dark:bg-[#DA7756]/20 dark:text-[#DA7756]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2520] dark:text-[#EDE5DC]">
              {domain.name}
            </h3>
            <p className="text-xs text-[#8E8377] dark:text-[#7E7368]">
              {domain.description}
            </p>
          </div>
        </div>
      </div>

      {/* Cheatsheet Quick Ref Cards */}
      {renderCheatsheetContent()}

      {/* 1-Click Starter Prompts */}
      {domain.examples && domain.examples.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8377] dark:text-[#7E7368]">
            {isVi ? 'Khởi động nhanh với mẫu ý tưởng:' : 'Launch with 1-Click Starters:'}
          </span>
          <div className="grid grid-cols-1 gap-2">
            {domain.examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectExample(example)}
                className="group flex items-center justify-between rounded-md border border-[#E6DFD3] bg-[#FFFFFF] p-2.5 text-left text-xs text-[#2B2520] transition hover:border-[#C15F3D] hover:bg-[#FDF6F0] hover:shadow-2xs dark:border-[#38312C] dark:bg-[#282320] dark:text-[#EDE5DC] dark:hover:border-[#DA7756] dark:hover:bg-[#33231D] cursor-pointer"
              >
                <span className="line-clamp-2 pr-2 font-medium leading-relaxed group-hover:text-[#C15F3D] dark:group-hover:text-[#DA7756]">
                  &ldquo;{example}&rdquo;
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8E8377] group-hover:text-[#C15F3D] dark:text-[#7E7368] dark:group-hover:text-[#DA7756] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
