create table "public"."profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "email" text not null,
    "avatar_url" text,
    "provider" text,
    "stripe_customer_id" text
);


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


create policy "profiles CRUD"
on "public"."profiles"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (auth.email() = ANY (ARRAY['joeytitanium@gmail.com'::text]))))
with check (((user_id = auth.uid()) OR (auth.email() = ANY (ARRAY['joeytitanium@gmail.com'::text]))));



