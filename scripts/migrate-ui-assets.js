const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_uHtIS1F3TCu2uK8z_587xd29h7tPwnWkPgqhHbHm736fla6';

async function migrateUIAssets() {
  const publicDir = path.join(process.cwd(), 'public');
  const assetsToMigrate = [
    'file.svg',
    'globe.svg',
    'next.svg',
    'vercel.svg',
    'window.svg'
  ];

  const urlMappings = {};

  for (const asset of assetsToMigrate) {
    const assetPath = path.join(publicDir, asset);
    
    if (fs.existsSync(assetPath)) {
      try {
        const buffer = fs.readFileSync(assetPath);
        const contentType = asset.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
        
        const blob = await put(`ui/${asset}`, buffer, {
          access: 'public',
          contentType: contentType,
          token: BLOB_TOKEN,
        });

        urlMappings[`/${asset}`] = blob.url;
        console.log(`✅ Migrated ${asset} to ${blob.url}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${asset}:`, error);
      }
    }
  }

  // Write URL mappings to a file for reference
  fs.writeFileSync(
    path.join(process.cwd(), 'blob-url-mappings.json'),
    JSON.stringify(urlMappings, null, 2)
  );

  console.log('\n📋 URL mappings saved to blob-url-mappings.json');
  console.log('Update your code to use these new URLs');
}

migrateUIAssets().catch(console.error); 