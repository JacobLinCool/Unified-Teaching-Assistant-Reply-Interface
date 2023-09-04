export interface Case {
	id: string;
	customer_email: string;
	assignee_id: string | null;
	status: string | null;
}

export interface Email {
	id: string;
	from: string;
	to: string;
	subject: string;
	body: string;
	date: string;
	case_id: string;
}

export interface Support {
	id: string;
	address: string;
}

export interface Subscription {
	id: string;
	email: string;
	case_id: string;
	type: "customer" | "support" | null;
}

export interface Database {
	case: Case;
	email: Email;
	support: Support;
	subscription: Subscription;
}
