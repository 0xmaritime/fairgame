import { promises as fs } from 'fs';
import path from 'path';
import { GameReview } from '../types/game-review';

const reviewsDirectory = path.join(process.cwd(), 'content', 'reviews');

export async function getAllReviews(): Promise<GameReview[]> {
  try {
    const filenames = await fs.readdir(reviewsDirectory);
    console.log('Found review filenames:', filenames); // Debug log
    const reviews = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(reviewsDirectory, filename);
        console.log('Reading file:', filePath); // Debug log
        const fileContents = await fs.readFile(filePath, 'utf8');
        const review = JSON.parse(fileContents) as GameReview;
        console.log('Parsed review:', review.slug); // Debug log
        return review;
      })
    );
    return reviews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error('Error in getAllReviews:', error); // Debug log
    return []; // Return empty array on error
  }
}

export async function getReviewBySlug(slug: string): Promise<GameReview | null> {
  const filePath = path.join(reviewsDirectory, `${slug}.json`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as GameReview;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // Review not found
    }
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
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim(); // Trim leading/trailing hyphens
  console.log(`Generated slug for "${title}": "${slug}"`); // Debug log
  return slug;
}
