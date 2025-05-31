import { promises as fs } from 'fs';
import path from 'path';
import { GameReview } from '../../../../types/game-review';

const reviewsDirectory = path.join(process.cwd(), 'content', 'reviews');

export async function getAllReviews(): Promise<GameReview[]> {
  try {
    const filenames = await fs.readdir(reviewsDirectory);
    const reviews = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(reviewsDirectory, filename);
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents) as GameReview;
      })
    );
    return reviews.sort((a: GameReview, b: GameReview) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    return [];
  }
}

export async function getReviewBySlug(slug: string): Promise<GameReview | null> {
  const filePath = path.join(reviewsDirectory, `${slug}.json`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as GameReview;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error(`Error in getReviewBySlug for ${slug}:`, error);
    throw error;
  }
}

export async function saveReview(review: GameReview): Promise<void> {
  const filePath = path.join(reviewsDirectory, `${review.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(review, null, 2));
}

export async function deleteReview(slug: string): Promise<void> {
  const filePath = path.join(reviewsDirectory, `${slug}.json`);
  await fs.unlink(filePath);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
