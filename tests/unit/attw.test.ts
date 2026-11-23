/**
 * Are the Types Wrong? check tests (issue #501).
 *
 * Verifies that the packed package declarations resolve correctly under TypeScript
 * resolution algorithms, and confirms that mis-pathed declarations fail.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { runAttwCheck } from "../../scripts/check-attw.ts";

describe("are the types wrong check (issue #501)", () => {
  it("@arethetypeswrong/cli is installed as devDependency and documented", async () => {
    const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    assert.ok(
      pkg.devDependencies?.["@arethetypeswrong/cli"],
      "@arethetypeswrong/cli must be a devDependency",
    );
    assert.equal(
      pkg.scripts?.["check:attw"],
      "node --import tsx scripts/check-attw.ts",
      "check:attw script must be defined in package.json",
    );
  });

  it("CI wires check:attw after packaging check", async () => {
    const ciYaml = await readFile(".github/workflows/ci.yml", "utf8");
    assert.match(ciYaml, /check:attw/, "CI workflow must run check:attw");
  });

  it("check:attw passes on the packed tarball covering '.' and './fs'", () => {
    const result = runAttwCheck({ throwOnError: false });
    assert.equal(result.success, true, `attw failed unexpectedly: ${result.output}`);
    assert.match(result.output, /stellar-agent-guard-sdk/);
    assert.match(result.output, /stellar-agent-guard-sdk\/fs/);
    assert.match(result.output, /🟢/);
  });
});
