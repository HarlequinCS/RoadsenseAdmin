import type { Metadata } from "next";
import { APK_DOWNLOAD_URL, SITE_URL, TAGLINE } from "./public-site";

export const SITE_NAME = "RoadSense";
export const SITE_LOCALE = "en_MY";

export const DEFAULT_TITLE = "Community Road Hazard Reporting";
export const DEFAULT_DESCRIPTION =
  "RoadSense is a crowdsourced road safety app for Malaysia. Report potholes, floods, and debris in seconds — photo, GPS, and community verification keep drivers safe.";

export const KEYWORDS = [
  "RoadSense",
  "road hazard reporting",
  "road safety Malaysia",
  "pothole report",
  "crowdsourced road safety",
  "driver safety app",
  "hazard map",
  "community road reporting",
  "UiTM",
  "Malaysia road hazards",
];

export const ORGANIZATION = {
  name: "RoadSense Team",
  affiliation: "Universiti Teknologi MARA (UiTM)",
  course: "ICT602 Mobile Programming",
};

type PageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  index?: boolean;
  keywords?: string[];
  openGraphTitle?: string;
};

export function absoluteUrl(path: string = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  index = true,
  keywords = KEYWORDS,
  openGraphTitle,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = openGraphTitle ?? `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${DEFAULT_TITLE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: ORGANIZATION.name }],
  creator: ORGANIZATION.name,
  publisher: ORGANIZATION.name,
  category: "technology",
  icons: {
    icon: "/roadsense-logo.svg",
    apple: "/roadsense-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-MY",
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: SITE_URL,
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "NavigationApplication",
    operatingSystem: "Android",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    downloadUrl: APK_DOWNLOAD_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MYR",
    },
    featureList: [
      "Real-time hazard map",
      "Photo and GPS reporting",
      "Community verification",
      "Proximity alerts",
      "Risk scoring",
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    url: SITE_URL,
    description: `${TAGLINE} Built by UiTM ICT602 students.`,
    slogan: TAGLINE,
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SITE_NAME}`,
    url: absoluteUrl("/about"),
    description:
      "Meet the UiTM ICT602 team behind RoadSense — crowdsourced road hazard reporting for Malaysian drivers.",
    mainEntity: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      affiliation: ORGANIZATION.affiliation,
    },
  };
}
