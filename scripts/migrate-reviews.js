const fs = require('fs');
const path = require('path');

function migrateExistingReviews() {
  const reviewsDir = path.join(process.cwd(), 'content', 'reviews');
  
  if (!fs.existsSync(reviewsDir)) {
    console.log('No reviews directory found');
    return;
  }

  const reviewFiles = fs.readdirSync(reviewsDir).filter(file => file.endsWith('.json'));

  reviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    const review = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // If featuredImage is a filename (not a URL), mark for manual migration
    if (review.featuredImage && !review.featuredImage.startsWith('http')) {
      console.log(`⚠️  Review "${review.title}" needs image migration:`);
      console.log(`   Current: ${review.featuredImage}`);
      console.log(`   Upload: public/uploads/${review.featuredImage} to Vercel Blob`);
      console.log('');
    }
  });
}

migrateExistingReviews(); 