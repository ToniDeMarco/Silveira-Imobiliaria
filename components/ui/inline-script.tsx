/**
 * Script inline executado durante o parse do HTML (antes da pintura).
 * No cliente vira `text/plain` para o React não reexecutar nem alertar.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
