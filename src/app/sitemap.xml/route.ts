import { NextResponse } from 'next/server';
import { GameReview } from '@/types/game-review';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com'; // Replace with your actual website URL

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`);
  if (!res.ok) {
    return new NextResponse('Failed to fetch reviews', { status: 500 });
  }
  const { reviews } = await res.json();

  const reviewUrls = reviews.map((review: GameReview) => {
    return `
      <url>
        <loc>${baseUrl}/reviews/${review.slug}</loc>
        <lastmod>${new Date(review.updatedAt).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/reviews</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>
      ${reviewUrls}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
