import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO component.
 * - Sets title, description, canonical URL
 * - Open Graph + Twitter Card tags (for social sharing)
 * - Optional JSON-LD structured data (rich snippets)
 *
 * Props:
 *   title:      string (required) — page title
 *   description: string — meta description
 *   canonical:  string — fully-qualified canonical URL (defaults to current href)
 *   image:      string — OG image URL (absolute preferred)
 *   type:       "website" | "product" | "article" (default: "website")
 *   jsonLd:     object | object[] — JSON-LD structured data
 *   noIndex:    bool — when true, adds robots noindex
 */
export const SEO = ({
    title,
    description,
    canonical,
    image,
    type = "website",
    jsonLd,
    noIndex = false,
}) => {
    const origin =
        typeof window !== "undefined" && window.location
            ? `${window.location.protocol}//${window.location.host}`
            : "";
    const url = canonical || (typeof window !== "undefined" ? window.location.href : "");
    const absImage = image
        ? image.startsWith("http")
            ? image
            : `${origin}${image.startsWith("/") ? "" : "/"}${image}`
        : `${origin}/logo.png`;

    const ldArray = jsonLd
        ? Array.isArray(jsonLd)
            ? jsonLd
            : [jsonLd]
        : [];

    return (
        <Helmet prioritizeSeoTags>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            {url && <link rel="canonical" href={url} />}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            {url && <meta property="og:url" content={url} />}
            <meta property="og:image" content={absImage} />
            <meta property="og:site_name" content="دُكانك" />
            <meta property="og:locale" content="ar_AR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {description && <meta name="twitter:description" content={description} />}
            <meta name="twitter:image" content={absImage} />

            {/* JSON-LD */}
            {ldArray.map((ld, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(ld)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
