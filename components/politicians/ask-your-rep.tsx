'use client'

import { useState, useCallback } from 'react'
import { MESSAGE_TEMPLATES, type MessageTemplate } from '@/lib/data/message-templates'

interface AskYourRepProps {
  politicianName: string
  state: string
  websiteUrl: string | null
  twitterUrl: string | null
  facebookUrl: string | null
  issues: Array<{ slug: string; name: string }>
}

function fillTemplate(text: string, name: string, state: string): string {
  return text.replace(/\{name\}/g, name).replace(/\{state\}/g, state)
}

export function AskYourRep({
  politicianName,
  state,
  websiteUrl,
  twitterUrl,
  facebookUrl,
  issues,
}: AskYourRepProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState('')
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  const templates = selectedIssue ? (MESSAGE_TEMPLATES[selectedIssue] ?? []) : []
  const activeTemplate: MessageTemplate | null = templates[selectedTemplateIdx] ?? null

  const handleCopy = useCallback(async () => {
    if (!activeTemplate) return
    const subject = fillTemplate(activeTemplate.subject, politicianName, state)
    const body = fillTemplate(activeTemplate.body, politicianName, state)
    const full = `Subject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = full
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [activeTemplate, politicianName, state])

  const hasContactLinks = websiteUrl || twitterUrl || facebookUrl

  // Only show issues that have templates
  const availableIssues = issues.filter((i) => MESSAGE_TEMPLATES[i.slug])

  if (availableIssues.length === 0) return null

  return (
    <div className="mt-8 border-t border-[var(--poli-border)] pt-6">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 py-3 text-left transition-colors hover:border-[var(--poli-input-border)]"
      >
        <div className="flex items-center gap-3">
          {/* Envelope icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--poli-badge-bg)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--poli-sub)]"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div>
            <span className="text-[14px] font-medium text-[var(--poli-text)]">
              Contact {politicianName}
            </span>
            <span className="ml-2 text-[12px] text-[var(--poli-faint)]">
              Ask Your Rep
            </span>
          </div>
        </div>
        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[var(--poli-faint)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-3 space-y-4">
          {/* Issue selector */}
          <div>
            <label
              htmlFor="ask-issue-select"
              className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]"
            >
              Select an issue
            </label>
            <select
              id="ask-issue-select"
              value={selectedIssue}
              onChange={(e) => {
                setSelectedIssue(e.target.value)
                setSelectedTemplateIdx(0)
                setCopied(false)
              }}
              className="w-full rounded-md border border-[var(--poli-input-border)] bg-[var(--poli-card)] px-3 py-2 text-[14px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-sub)]"
            >
              <option value="">Choose an issue...</option>
              {availableIssues.map((issue) => (
                <option key={issue.slug} value={issue.slug}>
                  {issue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template selector tabs */}
          {templates.length > 0 && (
            <div>
              <div className="mb-2 flex gap-2">
                {templates.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateIdx(idx)
                      setCopied(false)
                    }}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      idx === selectedTemplateIdx
                        ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                        : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
                    }`}
                  >
                    {t.label}
                    <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-60">
                      {t.tone}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Template preview */}
          {activeTemplate && (
            <div className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)]">
              {/* Subject line */}
              <div className="border-b border-[var(--poli-border)] px-4 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--poli-faint)]">
                  Subject
                </span>
                <p className="mt-0.5 text-[14px] font-medium text-[var(--poli-text)]">
                  {fillTemplate(activeTemplate.subject, politicianName, state)}
                </p>
              </div>

              {/* Body */}
              <div className="px-4 py-3">
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.65] text-[var(--poli-sub)]">
                  {fillTemplate(activeTemplate.body, politicianName, state)}
                </pre>
              </div>

              {/* Actions bar */}
              <div className="flex items-center justify-between border-t border-[var(--poli-border)] px-4 py-2.5">
                <p className="text-[11px] italic text-[var(--poli-faint)]">
                  This is a template to help you get started. Personalize it to make it more effective.
                </p>
                <button
                  onClick={handleCopy}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                    copied
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)] hover:bg-[var(--poli-hover)]'
                  }`}
                >
                  {copied ? (
                    <>
                      {/* Checkmark */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      {/* Copy icon */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Contact links */}
          {hasContactLinks && (
            <div>
              <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
                Send your message
              </p>
              <div className="flex flex-wrap gap-2">
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-input-border)] hover:text-[var(--poli-text)]"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Official Website
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-input-border)] hover:text-[var(--poli-text)]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X (Twitter)
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-input-border)] hover:text-[var(--poli-text)]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
