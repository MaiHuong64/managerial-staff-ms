import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];
    if (allowed.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("Chỉ chấp nhận file PDF, DOC, DOCX, JPG, PNG"));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
export const uploadExcel = multer ({
    storage: multer.memoryStorage(),
})