-- ============================================
-- YENDO — Schema MVP
-- Pegar en Supabase SQL Editor y ejecutar
-- ============================================

create extension if not exists "uuid-ossp";

create table public.trips (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  destination   text not null,
  start_date    date not null,
  end_date      date not null,
  share_token   uuid not null unique default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint valid_dates check (end_date >= start_date)
);

create table public.trip_members (
  id         uuid primary key default uuid_generate_v4(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'editor' check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique(trip_id, user_id)
);

create table public.flights (
  id             uuid primary key default uuid_generate_v4(),
  trip_id        uuid not null references public.trips(id) on delete cascade,
  airline        text not null,
  flight_number  text not null,
  origin         text not null,
  destination    text not null,
  departure_at   timestamptz not null,
  notes          text,
  created_at     timestamptz not null default now()
);

create table public.accommodations (
  id           uuid primary key default uuid_generate_v4(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  name         text not null,
  address      text not null,
  checkin_at   timestamptz not null,
  checkout_at  timestamptz not null,
  notes        text,
  created_at   timestamptz not null default now(),
  constraint valid_stay check (checkout_at > checkin_at)
);

create table public.activities (
  id         uuid primary key default uuid_generate_v4(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  name       text not null,
  starts_at  timestamptz not null,
  location   text,
  notes      text,
  created_at timestamptz not null default now()
);

create index on public.trips(owner_id);
create index on public.trips(share_token);
create index on public.trip_members(trip_id);
create index on public.trip_members(user_id);
create index on public.flights(trip_id);
create index on public.flights(departure_at);
create index on public.accommodations(trip_id);
create index on public.accommodations(checkin_at);
create index on public.activities(trip_id);
create index on public.activities(starts_at);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

alter table public.trips            enable row level security;
alter table public.trip_members     enable row level security;
alter table public.flights          enable row level security;
alter table public.accommodations   enable row level security;
alter table public.activities       enable row level security;

create or replace function public.is_trip_accessible(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.trips
    where id = p_trip_id and (
      owner_id = auth.uid()
      or exists (
        select 1 from public.trip_members
        where trip_id = p_trip_id and user_id = auth.uid()
      )
    )
  );
$$;

-- trips
create policy "trips_select" on public.trips for select using (owner_id = auth.uid() or exists (select 1 from public.trip_members where trip_id = trips.id and user_id = auth.uid()));
create policy "trips_insert" on public.trips for insert with check (owner_id = auth.uid());
create policy "trips_update" on public.trips for update using (owner_id = auth.uid());
create policy "trips_delete" on public.trips for delete using (owner_id = auth.uid());

-- trip_members
create policy "members_select" on public.trip_members for select using (public.is_trip_accessible(trip_id));
create policy "members_insert" on public.trip_members for insert with check (exists (select 1 from public.trips where id = trip_members.trip_id and owner_id = auth.uid()));
create policy "members_delete" on public.trip_members for delete using (exists (select 1 from public.trips where id = trip_members.trip_id and owner_id = auth.uid()));

-- flights
create policy "flights_select" on public.flights for select using (public.is_trip_accessible(trip_id));
create policy "flights_insert" on public.flights for insert with check (public.is_trip_accessible(trip_id));
create policy "flights_update" on public.flights for update using (public.is_trip_accessible(trip_id));
create policy "flights_delete" on public.flights for delete using (public.is_trip_accessible(trip_id));

-- accommodations
create policy "accomm_select" on public.accommodations for select using (public.is_trip_accessible(trip_id));
create policy "accomm_insert" on public.accommodations for insert with check (public.is_trip_accessible(trip_id));
create policy "accomm_update" on public.accommodations for update using (public.is_trip_accessible(trip_id));
create policy "accomm_delete" on public.accommodations for delete using (public.is_trip_accessible(trip_id));

-- activities
create policy "activities_select" on public.activities for select using (public.is_trip_accessible(trip_id));
create policy "activities_insert" on public.activities for insert with check (public.is_trip_accessible(trip_id));
create policy "activities_update" on public.activities for update using (public.is_trip_accessible(trip_id));
create policy "activities_delete" on public.activities for delete using (public.is_trip_accessible(trip_id));
