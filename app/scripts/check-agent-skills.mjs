#!/usr/bin/env node
/**
 * Checks that the agent skills are discoverable by both Claude Code and Codex.
 *
 * `.agents/skills/citi-*` is the single source. Claude Code only discovers
 * skills under `.claude/skills/`, so each CITi skill is mirrored there — by
 * symlink where the filesystem supports it, by copy otherwise (Windows refuses
 * symlinks without Developer Mode). That mirror is generated and git-ignored;
 * `prepare` regenerates it on every `pnpm install`. The `openspec-*` skills are
 * generated into both trees by the OpenSpec CLI and are only checked for
 * presence.
 *
 * Every exported function takes the repository root by injection so the checks
 * can run against a temporary tree in tests. Only the CLI entry point below
 * reads `process.cwd()` or exits the process.
 *
 * Usage:
 *   node scripts/check-agent-skills.mjs            verify
 *   node scripts/check-agent-skills.mjs --sync     recreate the mirror
 *   node scripts/check-agent-skills.mjs --sync --mode=copy
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CITI_PREFIX = "citi-";
const OPENSPEC_PREFIX = "openspec-";

export function agentsSkillsDir(root) {
  return path.join(root, ".agents", "skills");
}

export function claudeSkillsDir(root) {
  return path.join(root, ".claude", "skills");
}

function createReporter() {
  const problems = [];
  const notes = [];
  return {
    problems,
    notes,
    fail(message, hint) {
      problems.push(hint ? `${message}\n    → ${hint}` : message);
    },
    note(message) {
      notes.push(message);
    },
  };
}

function listSkillDirs(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(prefix))
    .sort();
}

/**
 * Minimal front matter reader: enough for `name`, without a YAML dependency.
 * Normalizes CRLF first — a Windows checkout rewrites the line endings and the
 * front matter would otherwise read as missing.
 */
export function readFrontMatter(file) {
  const content = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---", 4);
  if (end === -1) return null;
  const fields = {};
  for (const line of content.slice(4, end).split("\n")) {
    const match = /^([a-zA-Z-]+):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

function hashFile(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

/**
 * A symlink that did not survive checkout (Windows without core.symlinks)
 * becomes a small regular file whose content is the link target.
 */
function looksLikeUnresolvedSymlink(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.size > 512) return false;
  const content = fs.readFileSync(file, "utf8").trim();
  return !content.includes("\n") && content.includes("/");
}

const defaultSymlink = (target, linkPath) =>
  fs.symlinkSync(target, linkPath, "dir");

/**
 * Recreates the Claude Code mirror from the authored source. Returns the
 * strategy actually used per skill, which the CLI prints and the tests assert.
 *
 * `symlink` is injected so a test can exercise the fallback on a filesystem
 * that does allow symlinks.
 */
export function syncMirror({
  root,
  mode = "symlink",
  symlink = defaultSymlink,
}) {
  const agentsSkills = agentsSkillsDir(root);
  const claudeSkills = claudeSkillsDir(root);
  const results = [];

  fs.mkdirSync(claudeSkills, { recursive: true });
  for (const name of listSkillDirs(agentsSkills, CITI_PREFIX)) {
    const source = path.join(agentsSkills, name);
    const target = path.join(claudeSkills, name);
    fs.rmSync(target, { recursive: true, force: true });

    let used = mode;
    if (mode === "copy") {
      fs.cpSync(source, target, { recursive: true });
    } else {
      try {
        symlink(path.join("..", "..", ".agents", "skills", name), target);
      } catch (error) {
        // Windows refuses symlinks without Developer Mode or elevation. A copy
        // keeps the skill discoverable; `skills:check` guards it against drift.
        if (error.code !== "EPERM" && error.code !== "EACCES") throw error;
        fs.cpSync(source, target, { recursive: true });
        used = "copy";
      }
    }
    results.push({ name, strategy: used });
  }
  return results;
}

export function checkCitiSkills({ root }, reporter = createReporter()) {
  const agentsSkills = agentsSkillsDir(root);
  const claudeSkills = claudeSkillsDir(root);
  const sources = listSkillDirs(agentsSkills, CITI_PREFIX);

  if (sources.length === 0) {
    reporter.fail(
      "Nenhuma skill citi-* encontrada em .agents/skills/.",
      "A fonte única das skills do CITi vive em .agents/skills/citi-<nome>/SKILL.md.",
    );
    return reporter;
  }

  for (const name of sources) {
    const sourceFile = path.join(agentsSkills, name, "SKILL.md");
    if (!fs.existsSync(sourceFile)) {
      reporter.fail(`.agents/skills/${name}/ não tem SKILL.md.`);
      continue;
    }

    const frontMatter = readFrontMatter(sourceFile);
    if (!frontMatter) {
      reporter.fail(
        `.agents/skills/${name}/SKILL.md não tem front matter YAML válido.`,
      );
      continue;
    }
    if (frontMatter.name !== name) {
      reporter.fail(
        `.agents/skills/${name}/SKILL.md declara name: ${frontMatter.name ?? "(ausente)"}.`,
        `O campo name precisa ser igual ao nome do diretório: ${name}.`,
      );
    }
    if (!frontMatter.description) {
      reporter.fail(
        `.agents/skills/${name}/SKILL.md não tem description.`,
        "É a description que decide quando a skill é acionada.",
      );
    }

    const mirrorDir = path.join(claudeSkills, name);
    if (!fs.existsSync(mirrorDir)) {
      reporter.fail(
        `.claude/skills/${name} não existe — o Claude Code não vai enxergar esta skill.`,
        "Rode: pnpm skills:sync",
      );
      continue;
    }
    if (looksLikeUnresolvedSymlink(mirrorDir)) {
      reporter.fail(
        `.claude/skills/${name} é um arquivo de texto, não um symlink resolvido.`,
        "Resquício de um clone antigo com symlinks versionados. Rode: pnpm skills:sync",
      );
      continue;
    }

    const mirrorFile = path.join(mirrorDir, "SKILL.md");
    if (!fs.existsSync(mirrorFile)) {
      reporter.fail(
        `.claude/skills/${name}/SKILL.md não é legível.`,
        "Symlink quebrado. Rode: pnpm skills:sync",
      );
      continue;
    }

    if (fs.lstatSync(mirrorDir).isSymbolicLink()) {
      if (
        fs.realpathSync(mirrorDir) !==
        fs.realpathSync(path.join(agentsSkills, name))
      ) {
        reporter.fail(
          `.claude/skills/${name} aponta para fora de .agents/skills/${name}.`,
        );
      }
    } else if (hashFile(mirrorFile) !== hashFile(sourceFile)) {
      reporter.fail(
        `.claude/skills/${name}/SKILL.md divergiu da fonte em .agents/skills/.`,
        "A fonte é .agents/skills/. Rode: pnpm skills:sync",
      );
    }
  }

  reporter.note(
    `${sources.length} skills citi-* espelhadas em .claude/skills/.`,
  );
  return reporter;
}

export function checkOpenspecSkills({ root }, reporter = createReporter()) {
  const inAgents = listSkillDirs(agentsSkillsDir(root), OPENSPEC_PREFIX);
  const inClaude = listSkillDirs(claudeSkillsDir(root), OPENSPEC_PREFIX);

  if (inAgents.length === 0 || inClaude.length === 0) {
    reporter.fail(
      `Skills do OpenSpec presentes em .agents/skills/ (${inAgents.length}) e em .claude/skills/ (${inClaude.length}).`,
      "Os dois targets precisam estar configurados. Rode: pnpm exec openspec init --tools claude,codex",
    );
    return reporter;
  }

  const missing = inAgents.filter((name) => !inClaude.includes(name));
  if (missing.length > 0) {
    reporter.fail(
      `Skills do OpenSpec ausentes em .claude/skills/: ${missing.join(", ")}.`,
      "Rode: pnpm exec openspec init --tools claude,codex",
    );
  }

  reporter.note(`${inAgents.length} skills openspec-* nos dois targets.`);
  return reporter;
}

export function checkPinnedOpenspecVersion(
  { root },
  reporter = createReporter(),
) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const version =
    packageJson.devDependencies?.["@fission-ai/openspec"] ??
    packageJson.dependencies?.["@fission-ai/openspec"];

  if (!version) {
    reporter.fail("@fission-ai/openspec não está declarado no package.json.");
    return reporter;
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    reporter.fail(
      `@fission-ai/openspec está em "${version}".`,
      "Use versão exata: uma CLI mais nova regenera as skills com outro formato e quebra o CI.",
    );
  }
  return reporter;
}

/**
 * The repository decided to keep AGENTS.md as the durable source of its rules
 * and to avoid duplicated instructions that drift. A skill cites a rule; it
 * never copies it.
 */
export function checkNoDuplicatedRules({ root }, reporter = createReporter()) {
  const agentsFile = path.join(root, "AGENTS.md");
  if (!fs.existsSync(agentsFile)) {
    reporter.fail(
      "AGENTS.md não existe — as skills citam esse arquivo como fonte das regras.",
    );
    return reporter;
  }

  const normalize = (line) => line.trim().replace(/\s+/g, " ").toLowerCase();
  const agentsLines = new Set(
    fs
      .readFileSync(agentsFile, "utf8")
      .split("\n")
      .map(normalize)
      .filter((line) => line.length > 60),
  );

  for (const name of listSkillDirs(agentsSkillsDir(root), CITI_PREFIX)) {
    const file = path.join(agentsSkillsDir(root), name, "SKILL.md");
    if (!fs.existsSync(file)) continue;
    for (const [index, raw] of fs
      .readFileSync(file, "utf8")
      .split("\n")
      .entries()) {
      const line = normalize(raw);
      if (line.length > 60 && agentsLines.has(line)) {
        reporter.fail(
          `.agents/skills/${name}/SKILL.md:${index + 1} repete uma linha do AGENTS.md.`,
          "Cite a seção do AGENTS.md em vez de copiar a regra — cópias driftam.",
        );
      }
    }
  }
  return reporter;
}

export function checkAgentSkills({ root }) {
  const reporter = createReporter();
  checkCitiSkills({ root }, reporter);
  checkOpenspecSkills({ root }, reporter);
  checkPinnedOpenspecVersion({ root }, reporter);
  checkNoDuplicatedRules({ root }, reporter);
  return { problems: reporter.problems, notes: reporter.notes };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const root = process.cwd();
  const args = process.argv.slice(2);

  if (args.includes("--sync")) {
    const mode =
      args.find((arg) => arg.startsWith("--mode="))?.slice("--mode=".length) ??
      "symlink";
    process.stdout.write(
      `Espelhando .agents/skills/citi-* em .claude/skills/ (modo: ${mode})\n`,
    );
    for (const { name, strategy } of syncMirror({ root, mode })) {
      process.stdout.write(
        `  ${strategy === "copy" ? "copiado" : "linkado"}: ${name}\n`,
      );
    }
    process.stdout.write("Pronto.\n");
  } else {
    const { problems, notes } = checkAgentSkills({ root });

    if (problems.length > 0) {
      process.stderr.write(
        "\nConfiguração das skills de agente com problemas:\n\n",
      );
      for (const problem of problems) process.stderr.write(`  ✗ ${problem}\n`);
      process.stderr.write("\n");
      process.exitCode = 1;
    } else {
      for (const note of notes) process.stdout.write(`  ✓ ${note}\n`);
      process.stdout.write(
        "  ✓ Skills descobríveis pelo Claude Code e pelo Codex.\n",
      );
    }
  }
}
