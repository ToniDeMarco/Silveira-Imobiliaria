# Silveira Corretora — site + painel administrativo

Site de imobiliária com listagem e busca de imóveis, página de cada imóvel com galeria,
captação de leads e painel administrativo com upload de fotos.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 ·
Supabase (Postgres, Auth, Storage) · Vercel.

---

## Sumário

1. [Rodar no computador](#1-rodar-no-computador)
2. [Criar o projeto no Supabase](#2-criar-o-projeto-no-supabase)
3. [Rodar a migration e o seed](#3-rodar-a-migration-e-o-seed)
4. [Configurar a autenticação](#4-configurar-a-autenticação-importante)
5. [Criar o usuário administrador](#5-criar-o-usuário-administrador)
6. [Variáveis de ambiente](#6-variáveis-de-ambiente)
7. [Deploy na Vercel](#7-deploy-na-vercel)
8. [Usando o painel](#8-usando-o-painel)
9. [Reaproveitar para outro cliente](#9-reaproveitar-para-outro-cliente)
10. [Estrutura do projeto](#10-estrutura-do-projeto)
11. [Segurança](#11-segurança)
12. [Problemas comuns](#12-problemas-comuns)

---

## 1. Rodar no computador

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
cp .env.example .env.local   # no Windows (PowerShell): copy .env.example .env.local
npm run dev
```

Abra <http://localhost:3000>. Sem as variáveis do Supabase o site abre normalmente, porém sem
imóveis. O painel fica em <http://localhost:3000/admin>.

| Comando         | O que faz                                   |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento                 |
| `npm run build` | Build de produção (o mesmo que a Vercel roda) |
| `npm run start` | Serve o build de produção localmente        |
| `npm run lint`  | Verifica o código com ESLint                |

---

## 2. Criar o projeto no Supabase

1. Crie uma conta em <https://supabase.com> e clique em **New project**.
2. Preencha:
   - **Project name**: ex.: `silveira-corretora`.
   - **Database password**: clique em *Generate a password* e guarde num gerenciador de senhas
     (o site não usa essa senha, mas você pode precisar dela no futuro).
   - **Region**: clique em *Need a specific region?* e escolha **South America (São Paulo)**.
   - **Data access**:
     - ✅ **Enable Data API** — obrigatório (o site usa a API).
     - **Grant API access to new tables automatically** — pode deixar **desmarcado**: a migration
       concede as permissões necessárias explicitamente.
     - ✅ **Enable RLS on new tables automatically** — recomendado (camada extra de segurança).
3. Clique em **Create new project** e aguarde 1–2 minutos.

---

## 3. Rodar a migration e o seed

1. No painel do Supabase, abra **SQL Editor → New query**.
2. Copie todo o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   cole e clique em **Run**. Isso cria:
   - tabelas `imoveis`, `fotos_imovel`, `leads` e `admins`;
   - código automático (`IM0001`, `IM0002`…) e slug automático (título + código);
   - RLS (Row Level Security) em todas as tabelas;
   - o bucket público `fotos-imoveis` (limite de 1 MB, apenas WebP/JPEG) e suas políticas.
3. (Opcional) Em uma nova query, rode [`supabase/seed.sql`](supabase/seed.sql) para criar
   6 imóveis de exemplo. O último fica como **rascunho**, para você conferir que ele não aparece no site.

> Rode a migration **uma única vez**. Se precisar recomeçar do zero, apague o projeto e crie outro.

---

## 4. Configurar a autenticação (importante)

O painel não tem cadastro público — só entra quem você criar. Para garantir isso:

1. **Authentication → Sign In / Providers** → em **User Signups**, **desative**
   *“Allow new users to sign up”*. Mantenha o provedor **Email** habilitado.
2. **Authentication → URL Configuration**:
   - **Site URL**: a URL do site em produção (ex.: `https://www.silveiracorretora.com.br`).
   - **Redirect URLs**: adicione também `http://localhost:3000/**`.

> Mesmo que alguém consiga criar uma conta, ela não terá acesso a nada: o banco só libera dados
> para usuários cadastrados na tabela `admins` (veja o passo 5).

---

## 5. Criar o usuário administrador

1. **Authentication → Users → Add user → Create new user**.
2. Informe e-mail e senha e marque **Auto Confirm User**.
3. Libere esse usuário no painel rodando no **SQL Editor** (troque o e-mail):

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'email@do-admin.com';
```

Para remover o acesso de alguém:

```sql
delete from public.admins where email = 'email@do-admin.com';
```

Se alguém fizer login sem estar em `admins`, verá a tela **“Acesso não autorizado”**.

---

## 6. Variáveis de ambiente

No Supabase, abra **Project Settings → API Keys** (e **Data API** para a URL).

| Variável                        | Onde encontrar / valor                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL (ex.: `https://abcdefgh.supabase.co`)                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave **publishable** (`sb_publishable_…`) ou, nas chaves legadas, a **anon public**   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Chave **secret** (`sb_secret_…`) ou, nas legadas, a **service_role**. ⚠️ Nunca exponha |
| `NEXT_PUBLIC_SITE_URL`          | URL do site, sem barra no final (local: `http://localhost:3000`)                       |
| `NEXT_PUBLIC_WHATSAPP`          | WhatsApp com DDI + DDD, só números (ex.: `5538991485383`)                              |

Exemplo de `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP=5538991485383
```

> O arquivo `.env.local` **não vai para o Git** (está no `.gitignore`). Nunca publique a
> `SUPABASE_SERVICE_ROLE_KEY`: ela ignora todas as regras de segurança do banco. O projeto
> só a lê em `lib/supabase/admin.ts`, que é bloqueado para o navegador (`server-only`).

---

## 7. Deploy na Vercel

### 7.1 Enviar o código para o GitHub

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Site Silveira Corretora"
```

Crie um repositório **privado** no GitHub e siga as instruções dele para `git remote add origin …`
e `git push -u origin main`.

### 7.2 Importar na Vercel

1. Em <https://vercel.com>, clique em **Add New → Project** e importe o repositório.
2. Framework: **Next.js** (detectado automaticamente). Não altere os comandos de build.
3. Em **Environment Variables**, cadastre as 5 variáveis do passo 6, marcando
   **Production** e **Preview**. Em produção, use `NEXT_PUBLIC_SITE_URL` com o domínio final
   (ex.: `https://www.silveiracorretora.com.br`).
4. Clique em **Deploy**.
5. Depois do primeiro deploy: **Project → Settings → Functions → Function Region** →
   escolha **São Paulo, Brazil (gru1)** — a mesma região do Supabase — e faça **Redeploy**.
   Assim o servidor fica perto do banco e dos visitantes.

### 7.3 Domínio próprio

1. Na Vercel: **Project → Settings → Domains → Add** e siga as instruções de DNS.
2. Atualize `NEXT_PUBLIC_SITE_URL` na Vercel com o domínio e faça **Redeploy**
   (variáveis `NEXT_PUBLIC_*` são aplicadas no build).
3. No Supabase, atualize **Site URL** e **Redirect URLs** (passo 4).

### 7.4 Depois do deploy

- Cadastre o site no [Google Search Console](https://search.google.com/search-console) e envie
  o sitemap: `https://SEU-DOMINIO/sitemap.xml`.
- Deploys de **Preview** não são indexados pelo Google (o `robots.txt` bloqueia automaticamente).

---

## 8. Usando o painel

Acesse `/admin` (há também um link discreto “Área do corretor” no rodapé).

- **Novo imóvel**: preencha os dados e clique em *Criar imóvel e adicionar fotos*. O código e o
  endereço da página são gerados automaticamente.
- **Fotos**: arraste as imagens para a área indicada. Elas são comprimidas no navegador antes do
  envio (principal até 1600 px / ~250 KB e miniatura 400 px / ~50 KB, em WebP; JPEG no
  Safari/iPhone sem suporte a WebP). Arraste pela alça para reordenar e use **Capa** para
  escolher a foto principal.
- **Publicar**: o imóvel só aparece no site com status **Publicado**. “Vendido” e “Alugado” saem
  do site, mas continuam no painel.
- **Destaque**: imóveis marcados aparecem primeiro na página inicial.
- **Coordenadas**: no Google Maps, clique com o botão direito no local → copie as coordenadas →
  cole no campo **Latitude** (os dois campos são preenchidos). Com isso, o mapa aparece na página.
- **Leads**: contatos dos formulários. Clique no telefone para responder no WhatsApp ou use
  **Exportar CSV** (abre direto no Excel).

As alterações aparecem no site imediatamente após salvar.

---

## 9. Reaproveitar para outro cliente

| O que trocar                     | Onde                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Nome, cidade, CRECI, e-mail etc. | [`config/site.ts`](config/site.ts)                                           |
| Cores da marca                   | [`app/globals.css`](app/globals.css) → bloco **CORES DA MARCA** (`primary` e `secondary`) e `themeColor` em `app/layout.tsx` |
| Logo                             | [`components/site/logo.tsx`](components/site/logo.tsx) e [`app/icon.svg`](app/icon.svg) (favicon) |
| Fotos institucionais             | `public/images/hero.jpg`, `sobre.jpg`, `sobre-pagina.jpg` (mantenha os nomes) |
| Imagem de compartilhamento       | `app/opengraph-image.jpg` (1200×630) e `app/opengraph-image.alt.txt`         |
| Textos da home, Sobre e Contato  | `app/(site)/page.tsx`, `app/(site)/sobre/page.tsx`, `app/(site)/contato/page.tsx` |

As cores usam escalas (`primary-50` … `primary-950`). Ferramentas como
<https://uicolors.app> geram a escala a partir de uma única cor.

---

## 10. Estrutura do projeto

```
app/
  (site)/              Site público: home, /imoveis, /imoveis/[slug], /sobre, /contato
  admin/               Painel: login, imóveis, fotos, leads, exportação CSV
    actions.ts         Server Actions do painel (sempre verificam se é admin)
  actions/leads.ts     Server Action do formulário de contato
  sitemap.ts           /sitemap.xml dinâmico
  robots.ts            /robots.txt dinâmico
components/
  site/                Header, footer, logo, preloader, WhatsApp flutuante
  imoveis/             Cards, filtros, galeria/lightbox, formulário de lead
  admin/               Formulário de imóvel, gerenciador de fotos, diálogos
  ui/                  Botões, selos, ícones
config/site.ts         Dados do cliente
lib/
  supabase/            client.ts (navegador) · server.ts (sessão) · public.ts (anônimo)
                       admin.ts (service role, server-only) · proxy.ts (sessão no proxy)
  data/                Consultas do site (em cache) e do painel
  validations/         Schemas zod (lead e imóvel)
  fotos-upload.ts      Compressão e upload de fotos (navegador)
  seo.ts               Metadata e JSON-LD
proxy.ts               Protege /admin (no Next.js 16 o antigo middleware.ts chama-se proxy.ts)
supabase/              Migration e seed
types/                 Tipos do banco (database.ts) e do domínio (imovel.ts)
```

**Cache:** as páginas públicas são pré-renderizadas e ficam em cache (revalidação de 1 h).
Toda alteração feita no painel invalida o cache na hora (`updateTag('imoveis')`).

**Tipos do banco:** `types/database.ts` foi escrito a partir da migration. Se alterar o banco,
regenere com:

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID --schema public > types/database.ts
```

---

## 11. Segurança

- **RLS ativo** em `imoveis`, `fotos_imovel`, `leads` e `admins`.
- Visitantes só leem imóveis com status **publicado** (e as fotos deles); nunca leem `leads`.
- Visitantes só podem **inserir** leads (formulário), com validação, honeypot e bloqueio de
  envios automáticos muito rápidos.
- Tudo o que é de gestão exige estar na tabela `admins` — validado no banco (RLS), no `proxy.ts`,
  no layout do painel e em cada Server Action.
- A `SUPABASE_SERVICE_ROLE_KEY` só existe em `lib/supabase/admin.ts` (`import 'server-only'`);
  o build falha se ela for importada em código do navegador.
- Bucket `fotos-imoveis`: 1 MB por arquivo, apenas `image/webp` e `image/jpeg`; upload,
  alteração e exclusão apenas para admins.

---

## 12. Problemas comuns

| Sintoma                                        | Solução                                                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Site sem imóveis                               | Confira as variáveis do passo 6 e se os imóveis estão com status **Publicado**.                 |
| “Acesso não autorizado” ao entrar no painel    | O usuário não está na tabela `admins` — rode o SQL do passo 5.                                   |
| “E-mail ou senha incorretos”                   | Confira se o usuário foi criado com **Auto Confirm User** (ou confirme o e-mail).               |
| Fotos não aparecem                             | Verifique se a migration criou o bucket `fotos-imoveis` como **público**.                       |
| Erro no upload: “mime type not supported”      | O navegador gerou outro formato; atualize o navegador ou envie as fotos em JPG.                 |
| Mudança de domínio não refletiu nos links      | Atualize `NEXT_PUBLIC_SITE_URL` na Vercel e faça **Redeploy**.                                  |
