import { Helmet } from 'react-helmet-async';

const siteUrl = 'https://monmarchefute.com';
const defaultImage = `${siteUrl}/mon-marche-fute-og.png`;

interface SeoMetadataProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  indexable?: boolean;
}

export default function SeoMetadata({
  title,
  description,
  canonicalPath,
  image = defaultImage,
  type = 'website',
  indexable = true,
}: SeoMetadataProps) {
  const canonicalUrl = canonicalPath && indexable
    ? new URL(canonicalPath, siteUrl).toString()
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && indexable && <link rel="canonical" href={canonicalUrl} />}
      {!indexable && <meta name="robots" content="noindex,follow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
