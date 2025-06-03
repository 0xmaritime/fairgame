import { Review } from '@/types';

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`);
  if (!res.ok) {
    return [];
  }
  const { reviews } = await res.json();
  return reviews.map((review: Review) => ({
    slug: review.slug,
  }));
}

export const revalidate = 60; // Revalidate every 60 seconds
