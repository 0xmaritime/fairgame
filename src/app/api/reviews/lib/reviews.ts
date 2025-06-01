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
  try {
    // Ensure the reviews directory exists
    await fs.mkdir(reviewsDirectory, { recursive: true });
    
    const filePath = path.join(reviewsDirectory, `${review.slug}.json`);
    console.log('Saving review to:', filePath);
    
    // Write the review to a temporary file first
    const tempFilePath = `${filePath}.tmp`;
    await fs.writeFile(tempFilePath, JSON.stringify(review, null, 2));
    
    // Then rename it to the final file
    await fs.rename(tempFilePath, filePath);
    
    console.log('Review saved successfully to:', filePath);
  } catch (error) {
    console.error('Error saving review:', error);
    throw new Error(`Failed to save review: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteReview(slug: string): Promise<void> {
  const filePath = path.join(reviewsDirectory, `${slug}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting review ${slug}:`, error);
    throw error;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
