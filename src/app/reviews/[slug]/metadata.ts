import type { Metadata } from 'next';

interface ReviewPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/${slug}`);
    if (!res.ok) {
      return {};
    }
    const review = await res.json();

    if (!review) {
      return {};
    }

    // Ensure the image URL is absolute
    const imageUrl = review.featuredImage?.startsWith('http') 
      ? review.featuredImage 
      : review.featuredImage?.startsWith('/') 
        ? review.featuredImage 
        : `${process.env.NEXT_PUBLIC_BASE_URL}/${review.featuredImage}`;

    const title = `${review.title} - Fair Game Price Index`;
    const description = review.quickVerdict || `Read our review of ${review.gameTitle} and find its fair price.`;

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/reviews/${slug}`,
        siteName: 'Fair Game Price Index',
        type: 'article',
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title: title,
        description: description,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com'}/reviews/${slug}`,
      },
    };
  } catch (error) {
    return {};
  }
}
