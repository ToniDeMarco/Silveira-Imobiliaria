/** Bucket público do Supabase Storage com as fotos dos imóveis. */
export const BUCKET = "fotos-imoveis";

/** Limite do bucket (definido na migration): 1 MB por arquivo. */
export const LIMITE_BYTES = 1024 * 1024;

/** Tipos aceitos na seleção de arquivos (o resultado final é sempre webp ou jpeg). */
export const TIPOS_ACEITOS = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export const MAX_FOTOS_POR_ENVIO = 40;
