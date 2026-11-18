/**
 * Évaluateur d'expressions mathématiques 100 % sécurisé (zéro eval, zéro new Function).
 * Utilise un tokenizer + algorithme Shunting-Yard compilé en instructions RPN.
 * Cache interne pour garantir des performances constantes à 60 FPS.
 */

export interface MathExprContext {
  t: number;
  beat: number;
  i: number;
  bass: number;
  mid: number;
  treble: number;
  flux: number;
}

type Token =
  | { type: "num"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

type RpnOp =
  | { kind: "push_num"; value: number }
  | { kind: "push_var"; name: keyof MathExprContext }
  | { kind: "unary_neg" }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "%" | "^" }
  | { kind: "call"; name: string; argc: number };

const ALLOWED_VARS = new Set<keyof MathExprContext>([
  "t",
  "beat",
  "i",
  "bass",
  "mid",
  "treble",
  "flux",
]);

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  PI: Math.PI,
  tau: Math.PI * 2,
  TAU: Math.PI * 2,
};

const FUNCTION_ARITY: Record<string, number> = {
  sin: 1,
  cos: 1,
  tan: 1,
  abs: 1,
  min: 2,
  max: 2,
  clamp: 3,
  smoothstep: 3,
};

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 3,
  "u-": 4,
};

const RIGHT_ASSOC = new Set(["^", "u-"]);

function tokenize(expr: string): { ok: true; tokens: Token[] } | { ok: false; error: string } {
  const tokens: Token[] = [];
  let idx = 0;
  const len = expr.length;

  while (idx < len) {
    const ch = expr[idx];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      idx++;
      continue;
    }
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let end = idx;
      let dotCount = 0;
      while (end < len) {
        const c = expr[end];
        if (c >= "0" && c <= "9") {
          end++;
        } else if (c === ".") {
          dotCount++;
          if (dotCount > 1) {
            return { ok: false, error: `Nombre invalide près de la position ${idx + 1}` };
          }
          end++;
        } else {
          break;
        }
      }
      const numStr = expr.slice(idx, end);
      const val = Number(numStr);
      if (!Number.isFinite(val)) {
        return { ok: false, error: `Nombre invalide "${numStr}"` };
      }
      tokens.push({ type: "num", value: val });
      idx = end;
      continue;
    }
    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_") {
      let end = idx + 1;
      while (end < len) {
        const c = expr[end];
        if (
          (c >= "a" && c <= "z") ||
          (c >= "A" && c <= "Z") ||
          (c >= "0" && c <= "9") ||
          c === "_"
        ) {
          end++;
        } else {
          break;
        }
      }
      tokens.push({ type: "ident", value: expr.slice(idx, end) });
      idx = end;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      idx++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      idx++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma" });
      idx++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^") {
      tokens.push({ type: "op", value: ch });
      idx++;
      continue;
    }
    return {
      ok: false,
      error: `Caractère non autorisé "${ch}" à la position ${idx + 1}`,
    };
  }

  return { ok: true, tokens };
}

function compileToRpn(
  expr: string
): { ok: true; rpn: RpnOp[] } | { ok: false; error: string } {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { ok: false, error: "Expression mathématique vide." };
  }
  if (trimmed.length > 240) {
    return { ok: false, error: "Expression trop longue (max 240 caractères)." };
  }

  const tokRes = tokenize(trimmed);
  if (!tokRes.ok) return tokRes;
  const tokens = tokRes.tokens;

  const output: RpnOp[] = [];
  const opStack: Array<{ kind: "op"; value: string } | { kind: "fn"; name: string } | { kind: "lparen" }> = [];
  let expectOperand = true;

  for (let idx = 0; idx < tokens.length; idx++) {
    const tok = tokens[idx];
    const next = tokens[idx + 1];

    if (tok.type === "num") {
      if (!expectOperand) {
        return { ok: false, error: `Opérateur manquant avant ${tok.value}` };
      }
      output.push({ kind: "push_num", value: tok.value });
      expectOperand = false;
      continue;
    }

    if (tok.type === "ident") {
      if (!expectOperand) {
        return { ok: false, error: `Opérateur manquant avant "${tok.value}"` };
      }
      if (next?.type === "lparen") {
        if (!(tok.value in FUNCTION_ARITY)) {
          return {
            ok: false,
            error: `Fonction non autorisée "${tok.value}" (autorisées : ${Object.keys(FUNCTION_ARITY).join(", ")})`,
          };
        }
        opStack.push({ kind: "fn", name: tok.value });
        expectOperand = true;
        continue;
      }
      if (tok.value in CONSTANTS) {
        output.push({ kind: "push_num", value: CONSTANTS[tok.value] });
        expectOperand = false;
        continue;
      }
      if (ALLOWED_VARS.has(tok.value as keyof MathExprContext)) {
        output.push({
          kind: "push_var",
          name: tok.value as keyof MathExprContext,
        });
        expectOperand = false;
        continue;
      }
      return {
        ok: false,
        error: `Variable inconnue "${tok.value}" (autorisées : t, beat, i, bass, mid, treble, flux)`,
      };
    }

    if (tok.type === "lparen") {
      opStack.push({ kind: "lparen" });
      expectOperand = true;
      continue;
    }

    if (tok.type === "comma") {
      while (opStack.length > 0 && opStack[opStack.length - 1].kind !== "lparen") {
        const top = opStack.pop()!;
        if (top.kind === "op") {
          if (top.value === "u-") output.push({ kind: "unary_neg" });
          else output.push({ kind: "binary", op: top.value as "+" | "-" | "*" | "/" | "%" | "^" });
        }
      }
      if (opStack.length === 0) {
        return { ok: false, error: "Virgule hors d'un appel de fonction." };
      }
      expectOperand = true;
      continue;
    }

    if (tok.type === "rparen") {
      while (opStack.length > 0 && opStack[opStack.length - 1].kind !== "lparen") {
        const top = opStack.pop()!;
        if (top.kind === "op") {
          if (top.value === "u-") output.push({ kind: "unary_neg" });
          else output.push({ kind: "binary", op: top.value as "+" | "-" | "*" | "/" | "%" | "^" });
        }
      }
      if (opStack.length === 0) {
        return { ok: false, error: "Parenthèse fermante ')' sans '(' correspondante." };
      }
      opStack.pop(); // pop '('
      if (opStack.length > 0 && opStack[opStack.length - 1].kind === "fn") {
        const fn = opStack.pop() as { kind: "fn"; name: string };
        output.push({
          kind: "call",
          name: fn.name,
          argc: FUNCTION_ARITY[fn.name],
        });
      }
      expectOperand = false;
      continue;
    }

    if (tok.type === "op") {
      if (expectOperand) {
        if (tok.value === "+") {
          continue; // unary +
        }
        if (tok.value === "-") {
          opStack.push({ kind: "op", value: "u-" });
          continue;
        }
        return { ok: false, error: `Opérateur "${tok.value}" inattendu.` };
      }

      const p1 = PRECEDENCE[tok.value];
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.kind !== "op") break;
        const p2 = PRECEDENCE[top.value];
        if (
          (!RIGHT_ASSOC.has(tok.value) && p1 <= p2) ||
          (RIGHT_ASSOC.has(tok.value) && p1 < p2)
        ) {
          opStack.pop();
          if (top.value === "u-") output.push({ kind: "unary_neg" });
          else output.push({ kind: "binary", op: top.value as "+" | "-" | "*" | "/" | "%" | "^" });
        } else {
          break;
        }
      }
      opStack.push({ kind: "op", value: tok.value });
      expectOperand = true;
    }
  }

  if (expectOperand) {
    return { ok: false, error: "Expression incomplète (opérande manquant en fin de formule)." };
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.kind === "lparen") {
      return { ok: false, error: "Parenthèse '(' non fermée." };
    }
    if (top.kind === "op") {
      if (top.value === "u-") output.push({ kind: "unary_neg" });
      else output.push({ kind: "binary", op: top.value as "+" | "-" | "*" | "/" | "%" | "^" });
    }
  }

  // Vérification sèche de l'arité de la pile RPN
  let depth = 0;
  for (const ins of output) {
    if (ins.kind === "push_num" || ins.kind === "push_var") {
      depth++;
    } else if (ins.kind === "unary_neg") {
      if (depth < 1) return { ok: false, error: "Opérateur unaire '-' invalide." };
    } else if (ins.kind === "binary") {
      if (depth < 2) return { ok: false, error: `Opérateur "${ins.op}" manque d'opérandes.` };
      depth--;
    } else if (ins.kind === "call") {
      if (depth < ins.argc) {
        return {
          ok: false,
          error: `La fonction "${ins.name}" attend ${ins.argc} argument(s).`,
        };
      }
      depth = depth - ins.argc + 1;
    }
  }
  if (depth !== 1) {
    return { ok: false, error: "Syntaxe d'expression mathématique invalide." };
  }

  return { ok: true, rpn: output };
}

function execRpn(rpn: RpnOp[], ctx: MathExprContext): number {
  const stack: number[] = [];
  for (let idx = 0; idx < rpn.length; idx++) {
    const ins = rpn[idx];
    switch (ins.kind) {
      case "push_num":
        stack.push(ins.value);
        break;
      case "push_var":
        stack.push(ctx[ins.name]);
        break;
      case "unary_neg": {
        const a = stack.pop() ?? 0;
        stack.push(-a);
        break;
      }
      case "binary": {
        const b = stack.pop() ?? 0;
        const a = stack.pop() ?? 0;
        switch (ins.op) {
          case "+":
            stack.push(a + b);
            break;
          case "-":
            stack.push(a - b);
            break;
          case "*":
            stack.push(a * b);
            break;
          case "/":
            stack.push(Math.abs(b) < 1e-8 ? 0 : a / b);
            break;
          case "%":
            stack.push(Math.abs(b) < 1e-8 ? 0 : a % b);
            break;
          case "^":
            stack.push(Math.pow(a, b));
            break;
        }
        break;
      }
      case "call": {
        if (ins.argc === 1) {
          const x = stack.pop() ?? 0;
          if (ins.name === "sin") stack.push(Math.sin(x));
          else if (ins.name === "cos") stack.push(Math.cos(x));
          else if (ins.name === "tan") stack.push(Math.tan(x));
          else if (ins.name === "abs") stack.push(Math.abs(x));
        } else if (ins.argc === 2) {
          const b = stack.pop() ?? 0;
          const a = stack.pop() ?? 0;
          if (ins.name === "min") stack.push(Math.min(a, b));
          else if (ins.name === "max") stack.push(Math.max(a, b));
        } else if (ins.argc === 3) {
          const c = stack.pop() ?? 0;
          const b = stack.pop() ?? 0;
          const a = stack.pop() ?? 0;
          if (ins.name === "clamp") {
            const lo = Math.min(b, c);
            const hi = Math.max(b, c);
            stack.push(Math.max(lo, Math.min(hi, a)));
          } else if (ins.name === "smoothstep") {
            const span = b - a;
            if (Math.abs(span) < 1e-8) {
              stack.push(c >= b ? 1 : 0);
            } else {
              const t = Math.max(0, Math.min(1, (c - a) / span));
              stack.push(t * t * (3 - 2 * t));
            }
          }
        }
        break;
      }
    }
  }
  const res = stack[0] ?? 0;
  return Number.isFinite(res) ? res : 0;
}

const COMPILED_CACHE = new Map<string, RpnOp[] | null>();

function getCachedRpn(expr: string): RpnOp[] | null {
  const key = expr.trim();
  if (COMPILED_CACHE.has(key)) {
    return COMPILED_CACHE.get(key) ?? null;
  }
  if (COMPILED_CACHE.size > 512) {
    COMPILED_CACHE.clear();
  }
  const res = compileToRpn(key);
  const rpn = res.ok ? res.rpn : null;
  COMPILED_CACHE.set(key, rpn);
  return rpn;
}

export function validateMathExpression(
  expr: string
): { ok: true } | { ok: false; error: string } {
  const res = compileToRpn(expr);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export function compileMathExpression(
  expr: string
):
  | { ok: true; fn: (ctx: MathExprContext) => number }
  | { ok: false; error: string } {
  const res = compileToRpn(expr);
  if (!res.ok) return res;
  const rpn = res.rpn;
  return {
    ok: true,
    fn: (ctx: MathExprContext) => execRpn(rpn, ctx),
  };
}

export function evaluateMathExpression(
  expr: string,
  ctx: MathExprContext,
  fallback = 0
): number {
  const rpn = getCachedRpn(expr);
  if (!rpn) return fallback;
  return execRpn(rpn, ctx);
}
