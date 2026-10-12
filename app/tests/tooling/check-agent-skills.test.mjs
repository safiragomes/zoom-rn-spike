import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkAgentSkills,
  checkCitiSkills,
  checkOpenspecSkills,
  claudeSkillsDir,
  readFrontMatter,
  syncMirror,
} from "../../scripts/check-agent-skills.mjs";

/**
 * Resolved from this file rather than `process.cwd()`: `node --test` keeps
 * whatever directory it was started from.
 */
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

function skillBody(name, eol = "\n") {
  return [
    "---",
    `name: ${name}`,
    `description: Does ${name} things.`,
    "---",
    "",
    `# ${name}`,
    "",
    "Cites AGENTS.md instead of restating it.",
    "",
  ].join(eol);
}

/**
 * Builds a throwaway repository with the layout the guard inspects. Tests
 * mutate it afterwards to express the failure they care about.
 */
function makeRepo({
  citi = ["citi-playbook", "citi-tdd-cycle"],
  openspecInClaude = true,
  eol = "\n",
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agent-skills-"));

  for (const name of citi) {
    const dir = path.join(root, ".agents", "skills", name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), skillBody(name, eol), "utf8");
  }

  for (const tree of [".agents", ".claude"]) {
    if (tree === ".claude" && !openspecInClaude) continue;
    const dir = path.join(root, tree, "skills", "openspec-propose");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), "generated", "utf8");
  }
  fs.mkdirSync(claudeSkillsDir(root), { recursive: true });

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ devDependencies: { "@fission-ai/openspec": "1.5.0" } }),
    "utf8",
  );
  fs.writeFileSync(path.join(root, "AGENTS.md"), "# Rules\n", "utf8");

  return root;
}

const problemsOf = (root) => checkCitiSkills({ root }).problems;

describe("readFrontMatter", () => {
  it("reads metadata from a file that uses CRLF line endings", () => {
    const root = makeRepo({ eol: "\r\n" });
    const file = path.join(
      root,
      ".agents",
      "skills",
      "citi-playbook",
      "SKILL.md",
    );

    const frontMatter = readFrontMatter(file);
    assert.equal(frontMatter.name, "citi-playbook");
    assert.equal(frontMatter.description, "Does citi-playbook things.");
  });

  it("returns null when the file has no front matter", () => {
    const root = makeRepo();
    const file = path.join(root, "AGENTS.md");

    assert.equal(readFrontMatter(file), null);
  });
});

describe("syncMirror", () => {
  it("makes every skill discoverable as a directory holding SKILL.md", () => {
    const root = makeRepo();

    syncMirror({ root });

    for (const name of ["citi-playbook", "citi-tdd-cycle"]) {
      const mirror = path.join(claudeSkillsDir(root), name);
      assert.equal(fs.statSync(mirror).isDirectory(), true);
      assert.equal(fs.existsSync(path.join(mirror, "SKILL.md")), true);
    }
    assert.deepEqual(problemsOf(root), []);
  });

  it("serves byte-identical content through both agent locations", () => {
    const root = makeRepo();

    syncMirror({ root });

    const viaCodex = fs.readFileSync(
      path.join(root, ".agents", "skills", "citi-playbook", "SKILL.md"),
    );
    const viaClaude = fs.readFileSync(
      path.join(claudeSkillsDir(root), "citi-playbook", "SKILL.md"),
    );
    assert.equal(viaClaude.equals(viaCodex), true);
  });

  it("falls back to copying when the filesystem denies symlink creation", () => {
    const root = makeRepo();
    const denied = () => {
      throw Object.assign(new Error("operation not permitted"), {
        code: "EPERM",
      });
    };

    const results = syncMirror({ root, symlink: denied });

    assert.equal(
      results.every((result) => result.strategy === "copy"),
      true,
    );
    assert.deepEqual(problemsOf(root), []);
  });

  it("rethrows a symlink failure that is not a permission problem", () => {
    const root = makeRepo();
    const broken = () => {
      throw Object.assign(new Error("no space left"), { code: "ENOSPC" });
    };

    assert.throws(() => syncMirror({ root, symlink: broken }), /no space/);
  });

  it("is repeatable", () => {
    const root = makeRepo();

    syncMirror({ root, mode: "copy" });
    const second = syncMirror({ root, mode: "copy" });

    assert.equal(second.length, 2);
    assert.deepEqual(problemsOf(root), []);
  });
});

describe("checkCitiSkills", () => {
  it("reports a missing mirror entry with the command that fixes it", () => {
    const root = makeRepo();

    syncMirror({ root, mode: "copy" });
    fs.rmSync(path.join(claudeSkillsDir(root), "citi-playbook"), {
      recursive: true,
    });

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("citi-playbook"));
    assert.ok(problems[0].includes("pnpm skills:sync"));
  });

  it("reports a mirror that drifted from its source", () => {
    const root = makeRepo();

    syncMirror({ root, mode: "copy" });
    fs.writeFileSync(
      path.join(claudeSkillsDir(root), "citi-playbook", "SKILL.md"),
      skillBody("citi-playbook").replace("Does", "Edited by hand; does"),
      "utf8",
    );

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("divergiu"));
    assert.ok(problems[0].includes(".agents/skills/"));
  });

  it("identifies an unresolved symlink as such", () => {
    const root = makeRepo();

    syncMirror({ root, mode: "copy" });
    const mirror = path.join(claudeSkillsDir(root), "citi-playbook");
    fs.rmSync(mirror, { recursive: true });
    fs.writeFileSync(mirror, "../../.agents/skills/citi-playbook", "utf8");

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("arquivo de texto"));
    assert.ok(!problems[0].includes("front matter"));
  });

  it("accepts skills whose files use CRLF line endings", () => {
    const root = makeRepo({ eol: "\r\n" });

    syncMirror({ root, mode: "copy" });

    assert.deepEqual(problemsOf(root), []);
  });

  it("reports a declared name that disagrees with its directory", () => {
    const root = makeRepo();
    fs.writeFileSync(
      path.join(root, ".agents", "skills", "citi-playbook", "SKILL.md"),
      skillBody("citi-something-else"),
      "utf8",
    );

    syncMirror({ root, mode: "copy" });

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("citi-something-else"));
    assert.ok(problems[0].includes("citi-playbook"));
  });

  it("reports a skill that omits its description", () => {
    const root = makeRepo();
    fs.writeFileSync(
      path.join(root, ".agents", "skills", "citi-playbook", "SKILL.md"),
      "---\nname: citi-playbook\n---\n\n# citi-playbook\n",
      "utf8",
    );

    syncMirror({ root, mode: "copy" });

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("description"));
  });

  it("reports when no skill is authored at all", () => {
    const root = makeRepo({ citi: [] });

    const problems = problemsOf(root);
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes(".agents/skills/"));
  });
});

describe("checkOpenspecSkills", () => {
  it("accepts OpenSpec skills present in both agent locations", () => {
    const root = makeRepo();

    assert.deepEqual(checkOpenspecSkills({ root }).problems, []);
  });

  it("reports OpenSpec skills missing from the Claude Code location", () => {
    const root = makeRepo({ openspecInClaude: false });

    const problems = checkOpenspecSkills({ root }).problems;
    assert.equal(problems.length, 1);
    assert.ok(problems[0].includes("openspec init"));
  });
});

describe("this repository", () => {
  it("passes every agent skills check", () => {
    assert.deepEqual(checkAgentSkills({ root: repoRoot }).problems, []);
  });

  it("keeps the generated mirror out of version control", () => {
    const tracked = execFileSync("git", ["ls-files", ".claude/skills"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    assert.doesNotMatch(tracked, /citi-/);
    assert.match(tracked, /openspec-/);
  });
});
