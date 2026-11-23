-- =============================================================================
-- Dados de exemplo (fictícios) — 6 imóveis sem fotos.
-- Rode DEPOIS da migration 0001_init.sql, uma única vez.
-- `codigo` e `slug` são gerados automaticamente pelo banco.
-- O último imóvel fica como RASCUNHO para você testar que o visitante não o vê.
-- =============================================================================

insert into public.imoveis
  (titulo, descricao, finalidade, tipo, preco, condominio, iptu, cidade, bairro, endereco,
   quartos, suites, banheiros, vagas, area_total, area_construida, caracteristicas,
   latitude, longitude, destaque, status)
values
  (
    'Casa ampla com piscina no Cidade Jardim',
    E'Casa térrea em rua tranquila, com sala ampla integrada à cozinha planejada e área gourmet com piscina.\n\nAcabamento de primeira, porcelanato em toda a casa, forro de gesso e iluminação em LED. Quintal gramado e garagem coberta para três carros.',
    'venda', 'casa', 780000, null, 2100, 'Janaúba', 'Cidade Jardim', null,
    3, 1, 3, 3, 420, 210,
    array['Piscina', 'Área gourmet', 'Churrasqueira', 'Cozinha planejada', 'Quintal', 'Energia solar'],
    -15.7970, -43.3021, true, 'publicado'
  ),
  (
    'Apartamento mobiliado no Centro',
    E'Apartamento de 2 quartos, totalmente mobiliado, a poucos passos do comércio e dos serviços do Centro.\n\nPrédio com portaria e elevador. Ideal para quem busca praticidade.',
    'aluguel', 'apartamento', 1800, 350, 0, 'Janaúba', 'Centro', null,
    2, 1, 2, 1, 78, 78,
    array['Mobiliado', 'Elevador', 'Portaria', 'Varanda', 'Ar-condicionado'],
    -15.8025, -43.3086, true, 'publicado'
  ),
  (
    'Lote plano de 360 m² no Santo Antônio',
    E'Lote plano, pronto para construir, em bairro residencial com toda infraestrutura: asfalto, água, esgoto e energia.\n\nDocumentação em dia.',
    'venda', 'terreno', 95000, null, 380, 'Janaúba', 'Santo Antônio', null,
    null, null, null, null, 360, null,
    array['Plano', 'Escriturado', 'Rua asfaltada'],
    null, null, false, 'publicado'
  ),
  (
    'Sala comercial com vitrine na avenida principal',
    E'Ponto comercial de alta visibilidade, com vitrine de vidro temperado, banheiro e copa.\n\nExcelente fluxo de pedestres e veículos.',
    'aluguel', 'comercial', 3500, null, 450, 'Janaúba', 'Centro', null,
    null, null, 1, 2, 120, 120,
    array['Vitrine', 'Copa', 'Ar-condicionado', 'Estacionamento'],
    -15.8038, -43.3065, false, 'publicado'
  ),
  (
    'Chácara com pomar às margens do Rio Gorutuba',
    E'Chácara de 2 hectares com casa sede de 3 quartos, pomar formado, poço artesiano e acesso ao rio.\n\nPerfeita para lazer em família ou moradia tranquila a poucos minutos da cidade.',
    'venda', 'chacara', 650000, null, null, 'Janaúba', 'Zona Rural', null,
    3, 1, 2, 4, 20000, 180,
    array['Pomar', 'Poço artesiano', 'Acesso ao rio', 'Varanda', 'Churrasqueira', 'Curral'],
    -15.8228, -43.3270, true, 'publicado'
  ),
  (
    'Fazenda de 120 hectares para pecuária',
    E'Fazenda com pastagem formada, represa, curral, casa sede e casa de caseiro. Energia trifásica.\n\n(Rascunho: este imóvel não deve aparecer para visitantes.)',
    'venda', 'rural', 2400000, null, null, 'Janaúba', 'Zona Rural', 'Estrada vicinal, km 12',
    4, 2, 3, 6, 1200000, 350,
    array['Represa', 'Curral', 'Casa de caseiro', 'Energia trifásica', 'Pastagem formada'],
    null, null, false, 'rascunho'
  );
