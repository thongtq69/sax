const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'drjcfrxdg',
  api_key: '247498722789921',
  api_secret: 'dNO9V8M2R0XRBSgqBfTpsOvS89E'
});

cloudinary.uploader.upload('public/Banner.png', {
  public_id: 'email/banner',
  overwrite: true,
  format: 'png'
}).then(result => {
  console.log('Upload successful!');
  console.log('URL:', result.secure_url);
}).catch(err => {
  console.error('Error:', err.message);
});
