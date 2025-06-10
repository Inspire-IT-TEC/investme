ALTER TABLE "users" ADD COLUMN "cadastro_aprovado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_confirmado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "documentos_verificados" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "aprovado_por" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "aprovado_em" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_aprovado_por_admin_users_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;