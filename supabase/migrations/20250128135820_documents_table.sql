create table documents (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references profiles,
    created_at timestamp with time zone not null default now(),
    ip_address text,
    document_url text not null unique,
    document_type text not null,
    ocr_response jsonb,
    ocr_error jsonb,
    ai_prompt text,
    ai_response jsonb,
    ai_error jsonb,
    ai_prompt_tokens numeric,
    ai_completion_tokens numeric,
    ai_total_tokens numeric,
    ai_cost numeric,
    ai_model text,
    device_info jsonb not null
);
alter table documents enable row level security;
-- No policies as this is a private table that the user must not have access to.