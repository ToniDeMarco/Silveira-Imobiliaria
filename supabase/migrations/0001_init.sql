-- =============================================================================
-- Imobiliária Exemplo — estrutura inicial
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Funções utilitárias
-- -----------------------------------------------------------------------------

-- Atualiza `updated_at` automaticamente em qualquer UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Gera um slug a partir do título + código. Ex.: "Casa no Centro", "IM0001" -> "casa-no-centro-im0001"
create or replace function public.gerar_slug(p_titulo text, p_codigo text)
returns text
language sql
immutable
set search_path = ''
as $$
  select concat_ws(
    '-',
    nullif(
      left(
        trim(both '-' from regexp_replace(
          translate(
            lower(coalesce(p_titulo, '')),
            'áàâãäåéèêëíìîïóòôõöúùûüçñý',
            'aaaaaaeeeeiiiiooooouuuucny'
          ),
          '[^a-z0-9]+', '-', 'g'
        )),
        80
      ),
      ''
    ),
    lower(p_codigo)
  );
$$;


-- -----------------------------------------------------------------------------
-- Tabela: imoveis
-- -----------------------------------------------------------------------------

create sequence if not exists public.imoveis_codigo_seq start 1;

-- Próximo código sequencial: IM0001, IM0002 ... IM9999, IM10000 ...
create or replace function public.proximo_codigo_imovel()
returns text
language plpgsql
set search_path = ''
as $$
declare
  n bigint := nextval('public.imoveis_codigo_seq');
begin
  return 'IM' || case when n < 10000 then lpad(n::text, 4, '0') else n::text end;
end;
$$;

create table public.imoveis (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique default public.proximo_codigo_imovel(),
  titulo           text not null check (char_length(titulo) between 3 and 150),
  slug             text not null unique,
  descricao        text,
  finalidade       text not null check (finalidade in ('venda', 'aluguel')),
  tipo             text not null check (tipo in ('casa', 'apartamento', 'terreno', 'comercial', 'rural', 'chacara')),
  preco            numeric(12, 2) check (preco >= 0),
  condominio       numeric(10, 2) check (condominio >= 0),
  iptu             numeric(10, 2) check (iptu >= 0),
  cidade           text,
  bairro           text,
  endereco         text,                       -- opcional; o site não exibe por padrão
  quartos          int check (quartos >= 0),
  suites           int check (suites >= 0),
  banheiros        int check (banheiros >= 0),
  vagas            int check (vagas >= 0),
  area_total       numeric(12, 2) check (area_total >= 0),
  area_construida  numeric(12, 2) check (area_construida >= 0),
  caracteristicas  text[] not null default '{}',
  latitude         numeric(9, 6) check (latitude between -90 and 90),
  longitude        numeric(9, 6) check (longitude between -180 and 180),
  destaque         boolean not null default false,
  status           text not null default 'rascunho'
                     check (status in ('rascunho', 'publicado', 'vendido', 'alugado')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.imoveis.endereco is 'Endereço completo (opcional). Não é exibido no site público.';

-- Slug sempre derivado de título + código (gerado no INSERT e quando o título muda).
create or replace function public.imoveis_definir_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.titulo is distinct from old.titulo
     or new.codigo is distinct from old.codigo
     or coalesce(new.slug, '') = '' then
    new.slug := public.gerar_slug(new.titulo, new.codigo);
  end if;
  return new;
end;
$$;

create trigger imoveis_definir_slug
  before insert or update on public.imoveis
  for each row execute function public.imoveis_definir_slug();

create trigger imoveis_set_updated_at
  before update on public.imoveis
  for each row execute function public.set_updated_at();

create index imoveis_status_idx      on public.imoveis (status);
create index imoveis_finalidade_idx  on public.imoveis (finalidade);
create index imoveis_tipo_idx        on public.imoveis (tipo);
create index imoveis_cidade_idx      on public.imoveis (cidade);
create index imoveis_preco_idx       on public.imoveis (preco);
create index imoveis_created_at_idx  on public.imoveis (created_at desc);
create index imoveis_destaque_idx    on public.imoveis (destaque) where destaque;


-- -----------------------------------------------------------------------------
-- Tabela: fotos_imovel
-- -----------------------------------------------------------------------------

create table public.fotos_imovel (
  id             uuid primary key default gen_random_uuid(),
  imovel_id      uuid not null references public.imoveis (id) on delete cascade,
  url            text not null,
  url_thumb      text not null,
  caminho        text not null,
  caminho_thumb  text not null,
  ordem          int not null default 0,
  capa           boolean not null default false,
  created_at     timestamptz not null default now()
);

create index fotos_imovel_imovel_ordem_idx on public.fotos_imovel (imovel_id, ordem);
-- No máximo uma capa por imóvel.
create unique index fotos_imovel_uma_capa_idx on public.fotos_imovel (imovel_id) where capa;


-- -----------------------------------------------------------------------------
-- Tabela: leads
-- -----------------------------------------------------------------------------

create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  imovel_id   uuid references public.imoveis (id) on delete set null,
  nome        text not null check (char_length(nome) between 2 and 120),
  telefone    text not null check (char_length(telefone) between 8 and 30),
  email       text check (email is null or char_length(email) <= 160),
  mensagem    text check (mensagem is null or char_length(mensagem) <= 2000),
  origem      text not null default 'formulario' check (origem in ('formulario', 'whatsapp')),
  created_at  timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_imovel_id_idx  on public.leads (imovel_id);


-- -----------------------------------------------------------------------------
-- Tabela: admins — lista de usuários com acesso ao painel
-- Estar logado NÃO basta: o usuário precisa estar nesta tabela.
-- Para liberar alguém (no SQL Editor do Supabase):
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'email@do-admin.com';
-- -----------------------------------------------------------------------------

create table public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- SECURITY DEFINER: consulta `admins` ignorando o RLS dela, sem expor a tabela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;


-- =============================================================================
-- RLS — Row Level Security
-- `anon`          = visitante do site
-- `authenticated` = usuário logado; só tem poderes de admin se is_admin()
-- =============================================================================

alter table public.imoveis      enable row level security;
alter table public.fotos_imovel enable row level security;
alter table public.leads        enable row level security;
alter table public.admins       enable row level security;

-- admins ----------------------------------------------------------------------
-- Cada admin só enxerga o próprio registro. Sem policies de escrita:
-- inclusão/remoção apenas pelo SQL Editor (service role).
create policy "Admin vê o próprio registro"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- imoveis ---------------------------------------------------------------------
create policy "Visitantes veem apenas imóveis publicados"
  on public.imoveis for select
  to anon, authenticated
  using (status = 'publicado');

create policy "Admins gerenciam imóveis"
  on public.imoveis for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- fotos_imovel ----------------------------------------------------------------
create policy "Visitantes veem fotos de imóveis publicados"
  on public.fotos_imovel for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.imoveis i
      where i.id = fotos_imovel.imovel_id
        and i.status = 'publicado'
    )
  );

create policy "Admins gerenciam fotos"
  on public.fotos_imovel for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- leads -----------------------------------------------------------------------
create policy "Visitantes podem enviar leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Admins leem leads"
  on public.leads for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins atualizam leads"
  on public.leads for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins excluem leads"
  on public.leads for delete
  to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Permissões explícitas (privilégio mínimo)
-- Não dependem da opção "Grant API access to new tables automatically" do
-- projeto: primeiro removemos tudo e depois concedemos só o necessário.
-- O RLS acima continua filtrando QUAIS linhas cada papel pode acessar.
-- -----------------------------------------------------------------------------
revoke all on table public.imoveis, public.fotos_imovel, public.leads, public.admins
  from anon, authenticated;

-- Visitante (anon): lê imóveis/fotos (RLS: só publicados) e só ENVIA leads.
grant select on table public.imoveis, public.fotos_imovel to anon;
grant insert on table public.leads to anon;

-- Usuário logado: operações de gestão (RLS: só efetivas se for admin).
grant select, insert, update, delete on table public.imoveis, public.fotos_imovel to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select on table public.admins to authenticated;

-- service_role (usado apenas no servidor, ignora RLS).
grant all on table public.imoveis, public.fotos_imovel, public.leads, public.admins to service_role;

-- Sequência e funções usadas ao criar imóveis (código e slug automáticos).
grant usage, select on sequence public.imoveis_codigo_seq to authenticated, service_role;
grant execute on function public.proximo_codigo_imovel() to authenticated, service_role;
grant execute on function public.gerar_slug(text, text) to authenticated, service_role;


-- =============================================================================
-- STORAGE — bucket de fotos
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-imoveis', 'fotos-imoveis', true, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública: por ser um bucket público, qualquer pessoa abre as fotos
-- pela URL pública (/storage/v1/object/public/...), sem precisar de policy.
-- A policy de SELECT abaixo controla apenas a LISTAGEM de arquivos via API,
-- que fica restrita aos admins (assim ninguém lista fotos de imóveis em rascunho).
create policy "Admins listam fotos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fotos-imoveis' and (select public.is_admin()));

create policy "Admins enviam fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos-imoveis' and (select public.is_admin()));

create policy "Admins atualizam fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos-imoveis' and (select public.is_admin()))
  with check (bucket_id = 'fotos-imoveis' and (select public.is_admin()));

create policy "Admins excluem fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos-imoveis' and (select public.is_admin()));
