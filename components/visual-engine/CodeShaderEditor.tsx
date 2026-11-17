"use client";

import React, { useMemo, useRef } from "react";
import type { ScriptLanguage } from "@/lib/visual-engine/cpp-runtime";

interface CodeShaderEditorProps {
  id?: string;
  value: string;
  language: ScriptLanguage;
  errorLine?: number;
  rows?: number;
  onChange: (nextValue: string) => void;
  onPasteCode?: (pastedText: string, nextValue: string) => void;
}

interface TokenSpan {
  text: string;
  className: string;
}

const JS_KEYWORDS = new Set([
  "function",
  "const",
  "let",
  "var",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "of",
  "in",
  "new",
  "typeof",
  "true",
  "false",
  "null",
  "undefined",
]);

const CPP_KEYWORDS = new Set([
  "void",
  "float",
  "double",
  "int",
  "long",
  "unsigned",
  "bool",
  "auto",
  "const",
  "static",
  "constexpr",
  "inline",
  "char",
  "string",
  "String",
  "size_t",
  "using",
  "namespace",
  "std",
  "return",
  "if",
  "else",
  "for",
  "while",
  "true",
  "false",
  "nullptr",
  "NULL",
  "AnarchyCtx",
]);

const RUNTIME_BUILTINS = new Set([
  "renderAnarchyFrame",
  "ctx",
  "Math",
  "params",
  "sin",
  "cos",
  "tan",
  "sinf",
  "cosf",
  "abs",
  "fabsf",
  "fmod",
  "fmodf",
  "pow",
  "powf",
  "sqrt",
  "floor",
  "ceil",
  "round",
  "min",
  "max",
  "clamp",
  "lerp",
  "mix",
  "PI",
  "TWO_PI",
]);

function tokenizeLine(line: string, language: ScriptLanguage): TokenSpan[] {
  const spans: TokenSpan[] = [];
  const trimmed = line.trimStart();

  // Annotation uniforme // @param | // @color | // @toggle
  if (/^\/\/\s*@(?:param|color|toggle|bool)\b/i.test(trimmed)) {
    return [{ text: line, className: "text-emerald-400 font-bold" }];
  }

  // Directive préprocesseur C++ (#include, #define...)
  if (language === "cpp" && /^#\s*[a-zA-Z_]+/.test(trimmed)) {
    return [{ text: line, className: "text-pink-400" }];
  }

  let i = 0;
  const n = line.length;
  const keywords = language === "js" ? JS_KEYWORDS : CPP_KEYWORDS;

  while (i < n) {
    const ch = line[i];

    // Commentaire //
    if (ch === "/" && line[i + 1] === "/") {
      spans.push({ text: line.slice(i), className: "text-slate-500 italic" });
      break;
    }

    // Chaînes "...", '...', `...`
    if (ch === '"' || ch === "'" || (language === "js" && ch === "`")) {
      const quote = ch;
      let j = i + 1;
      while (j < n) {
        if (line[j] === "\\" && j + 1 < n) {
          j += 2;
          continue;
        }
        if (line[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      spans.push({
        text: line.slice(i, j),
        className: language === "js" ? "text-amber-300" : "text-lime-300",
      });
      i = j;
      continue;
    }

    // Opérateur flèche => en JS
    if (language === "js" && ch === "=" && line[i + 1] === ">") {
      spans.push({ text: "=>", className: "text-amber-400 font-bold" });
      i += 2;
      continue;
    }

    // Nombres (0.5f, 0xff, 180, -3.14)
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < n && /[0-9a-fA-FxX.fF]/.test(line[j])) j++;
      spans.push({ text: line.slice(i, j), className: "text-violet-300" });
      i = j;
      continue;
    }

    // Identifiants / Mots-clés
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1;
      while (j < n && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (keywords.has(word)) {
        spans.push({
          text: word,
          className:
            language === "js"
              ? "text-amber-400 font-semibold"
              : "text-sky-400 font-semibold",
        });
      } else if (RUNTIME_BUILTINS.has(word)) {
        spans.push({ text: word, className: "text-cyan-300 font-semibold" });
      } else {
        spans.push({ text: word, className: "text-slate-100" });
      }
      i = j;
      continue;
    }

    // Ponctuation / espaces
    let j = i + 1;
    while (
      j < n &&
      !/[a-zA-Z0-9_$"'`\/]/.test(line[j]) &&
      !(language === "js" && line[j] === "=" && line[j + 1] === ">")
    ) {
      j++;
    }
    spans.push({ text: line.slice(i, j), className: "text-slate-300" });
    i = j;
  }

  return spans;
}

export function CodeShaderEditor({
  id = "cpp-code-editor",
  value,
  language,
  errorLine,
  rows = 17,
  onChange,
  onPasteCode,
}: CodeShaderEditorProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(() => value.replace(/\r\n/g, "\n").split("\n"), [value]);
  const highlightedLines = useMemo(
    () => lines.map((line) => tokenizeLine(line, language)),
    [lines, language]
  );

  const syncScroll = (target: HTMLTextAreaElement) => {
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  };

  const heightPx = Math.max(260, rows * 20 + 20);

  return (
    <div className="rounded-lg border-2 border-black bg-[#0D1016] overflow-hidden">
      {/* Barre d'état coloration syntaxique */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#161B24] border-b border-neutral-800 font-mono text-[10px]">
        <span
          className={
            language === "js"
              ? "text-amber-300 font-bold"
              : "text-sky-300 font-bold"
          }
        >
          {language === "js"
            ? "🟨 JAVASCRIPT NATIF · V8 60 FPS (SANS TRANSPILEUR)"
            : "🟦 C++ TRANSPILEUR · ANARCHYCTX"}
        </span>
        <span className="text-slate-400">{lines.length} lignes</span>
      </div>

      {/* Éditeur : Numéros de ligne + Pre colorisé + Textarea caret */}
      <div className="relative flex" style={{ height: `${heightPx}px` }}>
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="w-10 shrink-0 py-2.5 bg-[#0A0C11] border-r border-neutral-800 text-right font-mono text-xs leading-5 select-none overflow-hidden"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isErr = errorLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`px-2 ${
                  isErr
                    ? "bg-red-900/70 text-red-200 font-bold"
                    : "text-slate-500"
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 px-3 py-2.5 font-mono text-xs leading-5 whitespace-pre overflow-hidden pointer-events-none"
          >
            {highlightedLines.map((spans, idx) => {
              const lineNum = idx + 1;
              const isErr = errorLine === lineNum;
              return (
                <div
                  key={lineNum}
                  className={isErr ? "bg-red-950/60" : undefined}
                >
                  {spans.length === 0 ? (
                    "\u00A0"
                  ) : (
                    spans.map((sp, spIdx) => (
                      <span key={spIdx} className={sp.className}>
                        {sp.text}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </pre>

          <textarea
            id={id}
            value={value}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onScroll={(e) => syncScroll(e.currentTarget)}
            onPaste={(e) => {
              const pasted = e.clipboardData?.getData("text");
              if (!pasted) return;
              const el = e.currentTarget;
              const start = el.selectionStart ?? 0;
              const end = el.selectionEnd ?? 0;
              const nextVal =
                value.slice(0, start) + pasted + value.slice(end);
              if (onPasteCode) {
                onPasteCode(pasted, nextVal);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart ?? 0;
                const end = el.selectionEnd ?? 0;
                const nextVal = value.slice(0, start) + "  " + value.slice(end);
                onChange(nextVal);
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2;
                });
              }
            }}
            onChange={(e) => onChange(e.target.value)}
            className="relative z-10 w-full h-full resize-none bg-transparent text-transparent caret-white px-3 py-2.5 font-mono text-xs leading-5 whitespace-pre overflow-auto focus:outline-none selection:bg-cyan-500/30"
          />
        </div>
      </div>
    </div>
  );
}
