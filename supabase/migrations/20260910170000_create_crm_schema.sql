create table public.customers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  company text not null,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  constraint customers_status_check check (status in ('Active', 'Pending', 'Inactive')),
  constraint customers_id_user_id_key unique (id, user_id)
);

create index customers_user_id_idx on public.customers (user_id);

create table public.customer_notes (
  id bigint generated always as identity primary key,
  customer_id bigint not null,
  user_id uuid not null,
  note text not null,
  created_at timestamptz not null default now(),
  constraint customer_notes_customer_id_fkey
    foreign key (customer_id) references public.customers (id) on delete cascade,
  constraint customer_notes_customer_owner_fkey
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade
);

create index customer_notes_customer_id_created_at_idx
  on public.customer_notes (customer_id, created_at desc);

create table public.customer_summaries (
  id bigint generated always as identity primary key,
  customer_id bigint not null,
  user_id uuid not null,
  summary text,
  created_at timestamptz not null default now(),
  constraint customer_summaries_customer_id_fkey
    foreign key (customer_id) references public.customers (id) on delete cascade,
  constraint customer_summaries_customer_owner_fkey
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade
);

create index customer_summaries_customer_id_created_at_idx
  on public.customer_summaries (customer_id, created_at desc);

create table public.customer_recommendations (
  id bigint generated always as identity primary key,
  customer_id bigint not null,
  user_id uuid not null,
  recommendation text not null,
  created_at timestamptz not null default now(),
  constraint customer_recommendations_customer_id_fkey
    foreign key (customer_id) references public.customers (id) on delete cascade,
  constraint customer_recommendations_customer_owner_fkey
    foreign key (customer_id, user_id)
    references public.customers (id, user_id)
    on delete cascade
);

create index customer_recommendations_customer_id_created_at_idx
  on public.customer_recommendations (customer_id, created_at desc);

alter table public.customers enable row level security;
alter table public.customer_notes enable row level security;
alter table public.customer_summaries enable row level security;
alter table public.customer_recommendations enable row level security;

create policy "customers_select_own"
  on public.customers
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "customers_insert_own"
  on public.customers
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "customers_update_own"
  on public.customers
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "customers_delete_own"
  on public.customers
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create policy "customer_notes_select_parent_owned"
  on public.customer_notes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_notes.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_notes_insert_parent_owned"
  on public.customer_notes
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_notes.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_notes_update_parent_owned"
  on public.customer_notes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_notes.customer_id
        and customers.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_notes.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_notes_delete_parent_owned"
  on public.customer_notes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_notes.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_summaries_select_parent_owned"
  on public.customer_summaries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_summaries.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_summaries_insert_parent_owned"
  on public.customer_summaries
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_summaries.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_summaries_update_parent_owned"
  on public.customer_summaries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_summaries.customer_id
        and customers.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_summaries.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_summaries_delete_parent_owned"
  on public.customer_summaries
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_summaries.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_recommendations_select_parent_owned"
  on public.customer_recommendations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_recommendations.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_recommendations_insert_parent_owned"
  on public.customer_recommendations
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_recommendations.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_recommendations_update_parent_owned"
  on public.customer_recommendations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_recommendations.customer_id
        and customers.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.customers
      where customers.id = customer_recommendations.customer_id
        and customers.user_id = (select auth.uid())
    )
  );

create policy "customer_recommendations_delete_parent_owned"
  on public.customer_recommendations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.customers
      where customers.id = customer_recommendations.customer_id
        and customers.user_id = (select auth.uid())
    )
  );
