create table "public"."documents" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "ip_address" text,
    "document_url" text not null,
    "document_type" text not null,
    "ocr_response" jsonb,
    "ocr_error" jsonb,
    "ai_prompt" text,
    "ai_response" jsonb,
    "ai_error" jsonb,
    "ai_prompt_tokens" numeric,
    "ai_completion_tokens" numeric,
    "ai_total_tokens" numeric,
    "ai_cost" numeric,
    "ai_model" text,
    "device_info" jsonb not null
);


alter table "public"."documents" enable row level security;

CREATE UNIQUE INDEX documents_file_url_key ON public.documents USING btree (document_url);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."documents" add constraint "documents_file_url_key" UNIQUE using index "documents_file_url_key";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";


