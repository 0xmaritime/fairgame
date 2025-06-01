const fs = require('fs');
const path = require('path');

function initReviewsDirectory() {
  const reviewsDir = path.join(process.cwd(), 'content', 'reviews');
  
  // Create content directory if it doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), 'content'))) {
    console.log('Creating content directory...');
    fs.mkdirSync(path.join(process.cwd(), 'content'), { recursive: true });
  }

  // Create reviews directory if it doesn't exist
  if (!fs.existsSync(reviewsDir)) {
    console.log('Creating reviews directory...');
    fs.mkdirSync(reviewsDir, { recursive: true });
  }

  // Ensure directory has proper permissions
  try {
    fs.chmodSync(reviewsDir, '755');
    console.log('✅ Reviews directory initialized successfully');
  } catch (error) {
    console.error('Failed to set directory permissions:', error);
  }
}

initReviewsDirectory(); 