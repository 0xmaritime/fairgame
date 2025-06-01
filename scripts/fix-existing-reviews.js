const fs = require('fs');
const path = require('path');

function fixExistingReviews() {
  const reviewsDir = path.join(process.cwd(), 'content', 'reviews');
  
  if (!fs.existsSync(reviewsDir)) {
    console.log('No reviews directory found');
    return;
  }

  const reviewFiles = fs.readdirSync(reviewsDir).filter(file => file.endsWith('.json'));

  reviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    const review = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let updated = false;

    // Fix field name inconsistencies
    if (review.reviewContent && !review.content) {
      review.content = review.reviewContent;
      delete review.reviewContent;
      updated = true;
    }

    // Add missing status field
    if (!review.status) {
      review.status = 'published'; // Assume existing reviews are published
      updated = true;
    }

    // Add missing fields
    if (!review.featuredImagePathname && review.featuredImage && !review.featuredImage.startsWith('http')) {
      review.featuredImagePathname = `reviews/${review.featuredImage}`;
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(review, null, 2));
      console.log(`✅ Fixed ${review.title}`);
    }
  });
}

fixExistingReviews(); 