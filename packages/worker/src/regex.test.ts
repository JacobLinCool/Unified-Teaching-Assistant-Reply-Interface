import { describe, expect, it, vi } from "vitest";
import { EMAIL_ALLOWLIST } from "./regex";

vi.stubGlobal("self", globalThis);

describe("test email allow list", async () => {
	const { base_pre_test_regex_test } = await import("utari");

	it("student email (41047099S@gapps.ntnu.edu.tw) should pass", () => {
		const email = "41047099S@gapps.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("student email (41047099s@gapps.ntnu.edu.tw) should pass", () => {
		const email = "41047099s@gapps.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("student email with . (41047099.s@gapps.ntnu.edu.tw) should pass", () => {
		const email = "41047099.s@gapps.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("student email with + (41047099s+1@gapps.ntnu.edu.tw) should not pass", () => {
		const email = "41047099s+1@gapps.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(false);
	});

	it("student email (41047099S@ntnu.edu.tw) should pass", () => {
		const email = "41047099S@ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("student email (41047099s@ntnu.edu.tw) should pass", () => {
		const email = "41047099s@ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("teacher email (knonete@gapps.ntnu.edu.tw) should pass", () => {
		const email = "knonete@gapps.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("teacher email (knonete@csie.ntnu.edu.tw) should pass", () => {
		const email = "knonete@csie.ntnu.edu.tw";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(true);
	});

	it("external email (example@gmail.com) should not pass", () => {
		const email = "example@gmail.com";
		expect(base_pre_test_regex_test(EMAIL_ALLOWLIST, email)).toBe(false);
	});
});
