export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  // Un escape Unicode conserva el texto original cuando se interpreta el JSON.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
