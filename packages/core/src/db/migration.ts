import debug from "debug";
import { Kysely } from "kysely";

const log = debug("utari:db:migration");
log.enabled = true;

export async function up(db: Kysely<any>): Promise<void> {
	const sql = [
		db.schema
			.createTable("support")
			.addColumn("id", "text", (col) => col.primaryKey())
			.addColumn("address", "text", (col) => col.notNull()),
		db.schema
			.createTable("case")
			.addColumn("id", "text", (col) => col.primaryKey())
			.addColumn("assignee_id", "text", (col) =>
				col.references("support.id").onDelete("set null").onUpdate("cascade"),
			)
			.addColumn("customer_email", "text", (col) => col.notNull())
			.addColumn("status", "text"),
		db.schema
			.createTable("email")
			.addColumn("id", "text", (col) => col.primaryKey())
			.addColumn("from", "text", (col) => col.notNull())
			.addColumn("to", "text", (col) => col.notNull())
			.addColumn("subject", "text", (col) => col.notNull())
			.addColumn("body", "text", (col) => col.notNull())
			.addColumn("date", "text", (col) => col.notNull())
			.addColumn("case_id", "text", (col) =>
				col.notNull().references("case.id").onDelete("cascade").onUpdate("cascade"),
			),
		db.schema
			.createTable("subscription")
			.addColumn("id", "text", (col) => col.primaryKey())
			.addColumn("email", "text", (col) => col.notNull())
			.addColumn("case_id", "text", (col) =>
				col.notNull().references("case.id").onDelete("cascade").onUpdate("cascade"),
			)
			.addColumn("type", "text"),
		db.schema.createIndex("email_case_id_index").on("email").column("case_id"),
		db.schema.createIndex("case_assignee_id_index").on("case").column("assignee_id"),
		db.schema.createIndex("support_address_index").on("support").column("address"),
		db.schema.createIndex("subscription_case_id_index").on("subscription").column("case_id"),
	];

	log("running migrations", sql.map((s) => s.compile().sql).join("\n\n"));
	for (const s of sql) {
		await s.execute();
		log("migration complete", s.compile().sql);
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex("email_case_id_index").execute();
	await db.schema.dropIndex("case_assignee_id_index").execute();
	await db.schema.dropIndex("support_address_index").execute();
	await db.schema.dropIndex("subscription_case_id_index").execute();

	await db.schema.dropTable("case").execute();
	await db.schema.dropTable("email").execute();
	await db.schema.dropTable("support").execute();
	await db.schema.dropTable("subscription").execute();
}
