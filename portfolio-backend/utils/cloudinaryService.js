const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a file buffer directly to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary target folder (e.g., 'portfolio/community')
 * @param {string} [options.publicId] - Optional custom public ID
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return reject(new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'));
    }

    const uploadOptions = {
      folder: options.folder || 'portfolio',
      resource_type: options.resourceType || 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1920, height: 1920, crop: 'limit' }
      ]
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    // Stream the buffer into the upload stream
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by its public_id
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    console.warn('Cloudinary not configured; skipping asset deletion for:', publicId);
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Error deleting asset ${publicId} from Cloudinary:`, error.message);
    // Don't throw so subsequent DB operations can continue safely
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
