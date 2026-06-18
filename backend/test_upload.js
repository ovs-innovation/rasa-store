const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: 'backend/.env' });

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A tiny 1x1 transparent pixel base64 image
const testFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

cloudinary.uploader.upload(testFile, { folder: 'test_rasa' })
  .then(result => {
    console.log('Upload Success!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  })
  .catch(err => {
    console.error('Upload Error:', err);
  });
