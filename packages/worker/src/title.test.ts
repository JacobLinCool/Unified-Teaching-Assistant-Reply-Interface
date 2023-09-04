import { describe, expect, it } from "vitest";
import { title_test } from "./title";

describe("test title", async () => {
	it("should validate correct titles", async () => {
		const validTitles: string[] = [
			"[hw1][p1] 題意詢問",
			"[hw1][p1]沒加空格 :(",
			"[hw2][general] Moodle 炸了延長提交時間詢問",
			"[mid][general] Makefile 詢問",
			"[bonus] 全勤加分詢問",
			"[general] 信件規範詢問",
		];

		for (const title of validTitles) {
			expect(() => title_test(title)).not.toThrow();
		}
	});

	it("should invalidate incorrect titles", async () => {
		const invalidTitles: string[] = [
			"只有標題",
			"[hw2] 作業提交詢問",
			"[hw1]p1] Missing opening bracket",
			"hw1][p1] Missing starting bracket",
			"[hw1][p1 Missing closing bracket",
			"[hw25][p6] Some Title",
		];

		for (const title of invalidTitles) {
			expect(() => title_test(title)).toThrow();
		}
	});
});
