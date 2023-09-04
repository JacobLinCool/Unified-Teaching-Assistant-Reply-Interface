import { expect, it, vi } from "vitest";
import _package from "../package.json";

vi.stubGlobal("self", globalThis);

it("version", async () => {
	const { pkg } = await import("../src");
	expect(pkg.version).toBe(_package.version);
});
