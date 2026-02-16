import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/lib/i18n";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type = "website"
}: SEOProps) => {
    const { language } = useLanguage();

    const siteName = language === 'ar' ? "فستان - عالم الأناقة" : "Fustan - World of Elegance";
    const defaultDescription = language === 'ar'
        ? "اكتشفي أرقى فساتين السهرة والزفاف في أكبر منصة متخصصة. تسوقي من أشهر المصممين واستخدمي تجربة القياس الافتراضية بالذكاء الاصطناعي."
        : "Discover the finest evening and wedding dresses on the largest specialized platform. Shop from top designers and try our AI virtual try-on experience.";

    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDescription = description || defaultDescription;
    const canonical = url ? `https://fustan.com${url}` : "https://fustan.com";
    const finalImage = image || "/og-image.jpg"; // Default OG image

    return (
        <Helmet>
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={finalDescription} />
            <meta property="twitter:image" content={finalImage} />

            <link rel="canonical" href={canonical} />
        </Helmet>
    );
};
