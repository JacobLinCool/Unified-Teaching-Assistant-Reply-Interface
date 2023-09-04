export const SubjectPreTest = {
	name: "subject-pre-test",
	"pre-test": async (message: ForwardableEmailMessage) => {
		const subject = message.headers.get("subject");
		if (!subject) {
			throw new Error("信件主旨不得為空");
		}

		const { category, problem, title } = title_test(subject);
		if (!title) {
			throw new Error(
				`請於主旨加入標題，例如：[${category}]${
					problem ? `[${problem}]` : ""
				} 我想詢問 XXX 問題`,
			);
		}
	},
};

export function title_test(subject: string) {
	const pattern =
		/(?:\[(hw\d)\](\[p\d\]|\[general\])(.+)|\[(mid|fin|bonus)\](\[general\])?(.+)|\[(mid|fin|bonus|general)\](.+))/;

	const match = subject.match(pattern);
	if (!match) {
		throw new Error("信件主旨格式錯誤，請參閱 https://hackmd.io/@cp2023/mail");
	}

	console.log(match);

	const category = (match[1] || match[4] || match[7]).trim();
	const problem = (match[2] || match[5] || "").slice(1, -1).trim();
	const title = (match[3] || match[6] || match[8] || "").trim();

	return { category, problem, title };
}
