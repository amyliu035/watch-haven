create table public.watched_movies (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null default auth.uid(),
    title text not null,
    rating integer check (rating >= 1 and rating <= 10),
    entry_time timestamp with time zone default timezone('utc'::text, now()) not null,
    related_urls text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.watched_movies enable row level security;

-- Policies
create policy "Users can view their own movies"
on public.watched_movies for select
using (auth.uid() = user_id);

create policy "Users can insert their own movies"
on public.watched_movies for insert
with check (auth.uid() = user_id);

create policy "Users can update their own movies"
on public.watched_movies for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own movies"
on public.watched_movies for delete
using (auth.uid() = user_id);
