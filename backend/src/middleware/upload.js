const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const photosDir = path.join(uploadsDir, 'photos');
const logosDir = path.join(uploadsDir, 'logos');
const signaturesDir = path.join(uploadsDir, 'signatures');
const designsDir = path.join(uploadsDir, 'designs');

[uploadsDir, photosDir, logosDir, signaturesDir, designsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const createStorage = (subDir) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadsDir, subDir)),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (JPEG, PNG, WebP) are allowed.'));
};

const designFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf|svg|ai|psd|eps/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error('Unsupported file format for design.'));
};

const uploadPhoto = multer({ storage: createStorage('photos'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadLogo = multer({ storage: createStorage('logos'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadSignature = multer({ storage: createStorage('signatures'), fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadDesign = multer({ storage: createStorage('designs'), fileFilter: designFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { uploadPhoto, uploadLogo, uploadSignature, uploadDesign };
