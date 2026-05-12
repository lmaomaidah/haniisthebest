create table public.wordle_rounds (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null,
  word text not null,
  word_length integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.wordle_guesses (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.wordle_rounds(id) on delete cascade,
  user_id uuid not null,
  guess text not null,
  green_count integer not null,
  yellow_count integer not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.wordle_guesses(round_id, created_at desc);

alter table public.wordle_rounds enable row level security;
alter table public.wordle_guesses enable row level security;

create policy "Host or admin can view full round"
  on public.wordle_rounds for select to authenticated
  using (host_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Host or admin can update round"
  on public.wordle_rounds for update to authenticated
  using (host_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Host or admin can delete round"
  on public.wordle_rounds for delete to authenticated
  using (host_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Authenticated can insert as host"
  on public.wordle_rounds for insert to authenticated
  with check (host_id = auth.uid());

create policy "Authenticated can view guesses"
  on public.wordle_guesses for select to authenticated using (true);

create policy "Users insert own guess"
  on public.wordle_guesses for insert to authenticated
  with check (user_id = auth.uid());

create policy "User or admin can delete guess"
  on public.wordle_guesses for delete to authenticated
  using (user_id = auth.uid() or has_role(auth.uid(), 'admin'));

create or replace function public.get_active_wordle_round()
returns table(id uuid, host_id uuid, host_username text, word_length integer, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.id, r.host_id, p.username, r.word_length, r.created_at
  from public.wordle_rounds r
  left join public.profiles p on p.user_id = r.host_id
  where r.is_active = true
  order by r.created_at desc
  limit 1
$$;

create or replace function public.start_wordle_round(_word text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _clean text;
  _new_id uuid;
begin
  if _uid is null then raise exception 'Authentication required'; end if;
  _clean := lower(trim(_word));
  if _clean !~ '^[a-z]{2,15}$' then
    raise exception 'Word must be 2-15 letters (a-z only)';
  end if;
  update public.wordle_rounds set is_active = false, ended_at = now() where is_active = true;
  insert into public.wordle_rounds(host_id, word, word_length)
  values (_uid, _clean, length(_clean))
  returning id into _new_id;
  return _new_id;
end;
$$;

create or replace function public.end_wordle_round(_round_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Authentication required'; end if;
  update public.wordle_rounds
  set is_active = false, ended_at = now()
  where id = _round_id
    and (host_id = _uid or has_role(_uid, 'admin'));
end;
$$;

create or replace function public.submit_wordle_guess(_round_id uuid, _guess text)
returns table(green_count integer, yellow_count integer, is_correct boolean, guess_number integer)
language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _word text;
  _len integer;
  _clean text;
  _green integer := 0;
  _yellow integer := 0;
  _i integer;
  _j integer;
  _wc text[];
  _gc text[];
  _used boolean[];
  _correct boolean;
begin
  if _uid is null then raise exception 'Authentication required'; end if;
  _clean := lower(trim(_guess));
  select word, word_length into _word, _len
    from public.wordle_rounds
    where id = _round_id and is_active = true;
  if _word is null then raise exception 'Round not active'; end if;
  if length(_clean) <> _len or _clean !~ ('^[a-z]{' || _len || '}$') then
    raise exception 'Guess must be % letters (a-z only)', _len;
  end if;

  if _clean = _word then
    _green := _len; _yellow := 0; _correct := true;
  else
    _wc := string_to_array(_word, null);
    _gc := string_to_array(_clean, null);
    _used := array_fill(false, array[_len]);
    for _i in 1.._len loop
      if _gc[_i] = _wc[_i] then
        _green := _green + 1;
        _used[_i] := true;
        _gc[_i] := '_';
      end if;
    end loop;
    for _i in 1.._len loop
      if _gc[_i] <> '_' then
        for _j in 1.._len loop
          if not _used[_j] and _wc[_j] = _gc[_i] then
            _yellow := _yellow + 1;
            _used[_j] := true;
            exit;
          end if;
        end loop;
      end if;
    end loop;
    _correct := false;
  end if;

  insert into public.wordle_guesses(round_id, user_id, guess, green_count, yellow_count, is_correct)
  values (_round_id, _uid, _clean, _green, _yellow, _correct);

  if _correct then
    update public.wordle_rounds set is_active = false, ended_at = now() where id = _round_id;
  end if;

  green_count := _green;
  yellow_count := _yellow;
  is_correct := _correct;
  select count(*)::int into guess_number
    from public.wordle_guesses
    where round_id = _round_id and user_id = _uid;
  return next;
end;
$$;

alter publication supabase_realtime add table public.wordle_guesses;
alter publication supabase_realtime add table public.wordle_rounds;