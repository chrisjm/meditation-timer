<script lang="ts">
	import { page } from '$app/stores';

	interface SEOProps {
		title?: string;
		description?: string;
		type?: string;
		image?: string;
		canonicalUrl?: string;
	}

	let {
		title = 'Meditation Timer - Focus on Your Practice',
		description = 'A simple meditation timer to enhance your practice with gentle interval bells, and healing solfeggio frequencies.',
		type = 'website',
		image = '/og-bg-v3-dark.png',
		canonicalUrl = 'https://meditation-timer-sable.vercel.app'
	} = $props();

	// Compute full canonical URL
	let fullCanonicalUrl = $derived(`${canonicalUrl}${$page.url.pathname}`);
	let fullImageUrl = $derived(`${canonicalUrl}${image}`);
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />

	<!-- Canonical URL -->
	<link rel="canonical" href={fullCanonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:url" content={fullCanonicalUrl} />
	<meta property="og:site_name" content="Meditation Timer" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={fullImageUrl} />

	<!-- Additional SEO Meta Tags -->
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />

	<!-- JSON-LD Schema -->
	{@html `
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "${title}",
            "description": "${description}",
            "url": "${fullCanonicalUrl}",
            "image": "${fullImageUrl}",
            "applicationCategory": "LifestyleApplication",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        }
        </script>
    `}
</svelte:head>
