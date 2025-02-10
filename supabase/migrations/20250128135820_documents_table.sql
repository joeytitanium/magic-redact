create table documents (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references profiles,
    created_at timestamp with time zone not null default now(),
    ip_address text,
    document_type text not null,
    num_pages numeric,
    ocr_error jsonb,
    ai_error jsonb,
    ai_input_tokens numeric,
    ai_output_tokens numeric,
    ai_total_tokens numeric,
    ai_input_cost numeric,
    ai_output_cost numeric,
    ai_total_cost numeric,
    ai_model text,
    device_info jsonb not null
);
alter table documents enable row level security;
-- No policies as this is a private table that the user must not have access to.