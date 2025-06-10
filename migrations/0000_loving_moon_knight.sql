CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"senha" text NOT NULL,
	"nome" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"perfil" text DEFAULT 'visualizacao' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"acao" text NOT NULL,
	"entidade_tipo" text NOT NULL,
	"entidade_id" integer NOT NULL,
	"valor_anterior" json,
	"valor_novo" json,
	"observacoes" text,
	"admin_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"razao_social" text NOT NULL,
	"nome_fantasia" text,
	"cnpj" text NOT NULL,
	"cep" text NOT NULL,
	"rua" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"telefone" text,
	"email_contato" text,
	"cnae_principal" text NOT NULL,
	"cnae_secundarios" text[],
	"inscricao_estadual" text,
	"inscricao_municipal" text,
	"data_fundacao" timestamp NOT NULL,
	"faturamento" numeric(15, 2) NOT NULL,
	"ebitda" numeric(15, 2) NOT NULL,
	"divida_liquida" numeric(15, 2) NOT NULL,
	"status" text DEFAULT 'pendente_analise' NOT NULL,
	"observacoes_internas" text,
	"analisado_por" integer,
	"data_analise" timestamp,
	"user_id" integer,
	"entrepreneur_id" integer,
	"investor_id" integer,
	"tipo_proprietario" text DEFAULT 'empreendedor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "company_guarantees" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"matricula" text,
	"renavam" text,
	"descricao" text,
	"valor_estimado" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_shareholders" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"nome_completo" text NOT NULL,
	"cpf" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"valor_solicitado" numeric(15, 2) NOT NULL,
	"prazo_meses" integer NOT NULL,
	"finalidade" text NOT NULL,
	"documentos" text[],
	"status" text DEFAULT 'na_rede' NOT NULL,
	"investor_id" integer,
	"data_aceite" timestamp,
	"data_limite_analise" timestamp,
	"observacoes_analise" text,
	"analisado_por" integer,
	"data_analise" timestamp,
	"aprovado_por_backoffice" integer,
	"data_aprovacao_backoffice" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entrepreneurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"cpf" text NOT NULL,
	"rg" text NOT NULL,
	"nome_completo" text NOT NULL,
	"email" text NOT NULL,
	"senha" text NOT NULL,
	"cep" text NOT NULL,
	"rua" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"cadastro_aprovado" boolean DEFAULT false,
	"email_confirmado" boolean DEFAULT false,
	"documentos_verificados" boolean DEFAULT false,
	"aprovado_por" integer,
	"aprovado_em" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entrepreneurs_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "entrepreneurs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"cpf" text NOT NULL,
	"rg" text NOT NULL,
	"nome_completo" text NOT NULL,
	"email" text NOT NULL,
	"senha" text NOT NULL,
	"cep" text NOT NULL,
	"rua" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"limite_investimento" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"cadastro_aprovado" boolean DEFAULT false,
	"email_confirmado" boolean DEFAULT false,
	"documentos_verificados" boolean DEFAULT false,
	"aprovado_por" integer,
	"aprovado_em" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investors_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "investors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"assunto" text,
	"tipo" text NOT NULL,
	"remetente_id" integer NOT NULL,
	"destinatario_tipo" text NOT NULL,
	"conteudo" text NOT NULL,
	"anexos" text[],
	"lida" boolean DEFAULT false NOT NULL,
	"credit_request_id" integer,
	"company_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"cpf" text NOT NULL,
	"rg" text NOT NULL,
	"nome_completo" text NOT NULL,
	"email" text NOT NULL,
	"senha" text NOT NULL,
	"cep" text NOT NULL,
	"rua" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"tipo" text DEFAULT 'entrepreneur' NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"telefone" text,
	"limite_investimento" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_analisado_por_admin_users_id_fk" FOREIGN KEY ("analisado_por") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_entrepreneur_id_entrepreneurs_id_fk" FOREIGN KEY ("entrepreneur_id") REFERENCES "public"."entrepreneurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_guarantees" ADD CONSTRAINT "company_guarantees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_shareholders" ADD CONSTRAINT "company_shareholders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_analisado_por_users_id_fk" FOREIGN KEY ("analisado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_aprovado_por_backoffice_admin_users_id_fk" FOREIGN KEY ("aprovado_por_backoffice") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entrepreneurs" ADD CONSTRAINT "entrepreneurs_aprovado_por_admin_users_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_aprovado_por_admin_users_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_credit_request_id_credit_requests_id_fk" FOREIGN KEY ("credit_request_id") REFERENCES "public"."credit_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;