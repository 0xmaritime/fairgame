import prisma from '../lib/prisma.js';
import { put } from '@vercel/blob';
import * as fs from 'fs/promises';
import * as path from 'path';

async function migrateToBlob() {
  try {
    // Get all reviews with featured images
    const reviews = await prisma.review.findMany({
      where: {
        featuredImage: {
          not: '',
        },
      },
    });

    console.log(`Found ${reviews.length} reviews to migrate`);

    for (const review of reviews) {
      try {
        // Skip if the image is already a blob URL
        if (review.featuredImage.startsWith('https://')) {
          console.log(`Skipping review ${review.id} - already using blob storage`);
          continue;
        }

        // Get the local file path
        const localPath = path.join(process.cwd(), 'public', review.featuredImage);
        
        // Read the file
        const fileBuffer = await fs.readFile(localPath);
        
        // Generate a new pathname for the blob
        const pathname = `reviews/${Date.now()}-${path.basename(review.featuredImage)}`;
        
        // Upload to blob
        const blob = await put(pathname, fileBuffer, {
          access: 'public',
        });

        // Update the review with the new blob URL
        await prisma.review.update({
          where: { id: review.id },
          data: {
            featuredImage: blob.url,
            featuredImagePathname: blob.pathname,
          },
        });

        console.log(`Migrated review ${review.id} - ${blob.url}`);

        // Delete the local file
        await fs.unlink(localPath);
      } catch (error) {
        console.error(`Error migrating review ${review.id}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToBlob(); 