/** 
* PROFILES
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table profiles (
    id uuid references auth.users(id) on delete cascade on update cascade not null primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    email text not null,
    avatar_url text,
    provider text,
    stripe_customer_id text,
    UNIQUE(stripe_customer_id)
);
alter table profiles enable row level security;
create policy "Can view own profile data." on profiles for select using (auth.uid() = id);
create policy "Can update own profile data." on profiles for update using (auth.uid() = id);

-- This trigger automatically creates a user entry when a new user signs up via supabase auth
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, name, email, provider, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'name', new.email, new.raw_app_meta_data ->> 'provider', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row 
  execute procedure public.handle_new_user();

/**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

create table subscriptions (
  id text primary key, -- Subscription ID from Stripe, e.g. sub_1234.
  user_id uuid references profiles on delete cascade on update cascade not null,
  status subscription_status,
  
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb, 

  -- ID of the price that created this subscription.
  price_id text, 

  -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
  quantity integer, 

  -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
  cancel_at_period_end boolean, 

  -- Time at which the subscription was created.
  created timestamp with time zone default timezone('utc'::text, now()) not null, 

  -- Start of the current period that the subscription has been invoiced for.  
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,

  -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null, 

  -- If the subscription has ended, the timestamp of the date the subscription ended.
  ended_at timestamp with time zone default timezone('utc'::text, now()), 

  -- A date in the future at which the subscription will automatically get canceled.
  cancel_at timestamp with time zone default timezone('utc'::text, now()), 

  -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
  canceled_at timestamp with time zone default timezone('utc'::text, now()), 

  -- If the subscription has a trial, the beginning of that trial.
  trial_start timestamp with time zone default timezone('utc'::text, now()), 

  -- If the subscription has a trial, the end of that trial.
  trial_end timestamp with time zone default timezone('utc'::text, now()),

  -- The brand of the card used for the subscription.
  brand text,

  -- The last 4 digits of the card used for the subscription.
  last4 text
);
alter table subscriptions enable row level security;
create policy "Can only view own subscription data." on subscriptions for select using (auth.uid() = user_id);
