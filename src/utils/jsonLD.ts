import { type CollectionEntry } from "astro:content";

// utils
import { getTranslatedData } from "@utils/translationUtils";
import { defaultLocale } from "@config/siteSettings.json";

// data - siteData.title should not change based on locale so this should be fine
const siteData = getTranslatedData("siteData", defaultLocale);

interface GeneralProps {
	type: "general";
}

export interface PromptProps {
	type: "prompt";
	postFrontmatter: CollectionEntry<"prompts">["data"];
	image: any; // result of getImage() from Seo.astro
	authors: CollectionEntry<"authors">[];
	canonicalUrl: URL;
}

export type JsonLDProps = PromptProps | GeneralProps;

export default function jsonLDGenerator(props: JsonLDProps) {
	const { type } = props;
	if (type === "prompt") {
		const { postFrontmatter, image, authors, canonicalUrl } = props as PromptProps;

		let authorsJsonLdArray = authors.map((author) => {
			return {
				"@type": "Person",
				name: author.data.name,
				url: author.data.authorLink,
			};
		});

		let authorsJsonLd;

		if (authorsJsonLdArray.length === 1) {
			authorsJsonLd = authorsJsonLdArray[0];
		} else {
			authorsJsonLd = authorsJsonLdArray;
		}

		// Safely access potentially undefined frontmatter fields with type assertion
		const frontmatter = postFrontmatter as {
			title?: string;
			lede?: string;
			description?: string;
			date_first_published?: string;
			date_last_updated?: string;
			pubDate?: string;
			updatedDate?: string;
			tags: string[];
			authors: string[];
		};

		const title = frontmatter.title || "Untitled Prompt";
		const description = frontmatter.lede || frontmatter.description || "";
		const datePublished = frontmatter.date_first_published || frontmatter.pubDate || new Date().toISOString();
		const dateModified = frontmatter.date_last_updated || frontmatter.updatedDate || datePublished;

		return `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "${canonicalUrl}"
        },
        "headline": "${title}",
        "description": "${description}",
        "image": "${image?.src || ""}",
        "author": ${JSON.stringify(authorsJsonLd)},
        "datePublished": "${datePublished}",
        "dateModified": "${dateModified}"
      }
    </script>`;
	}
	return `<script type="application/ld+json">
      {
      "@context": "https://schema.org/",
      "@type": "WebSite",
      "name": "${siteData.title}",
      "url": "${import.meta.env.SITE}"
      }
    </script>`;
}
