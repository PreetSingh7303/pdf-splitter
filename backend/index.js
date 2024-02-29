
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = 5000;

// app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://pdf-splitter.netlify.app');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
//   });
app.use(cors({
    origin: 'https://pdf-splitter.netlify.app'
  }));
  
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filename: req.file.originalname });
});
app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
app.post('/create-pdf', upload.single('file'), async (req, res) => {
    const { file, pages } = req.body;
    const selectedPages = JSON.parse(pages);
    const filePath = req.file.path;

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const newPdfDoc = await PDFDocument.create();
    for (const pageNum of selectedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
    }

    const pdfBytesResult = await newPdfDoc.save();
    const outputPath = 'public/output.pdf'; // Corrected file path
    fs.writeFileSync(outputPath, pdfBytesResult);

    res.sendFile(`${__dirname}/${outputPath}`);
});

app.listen(process.env.PORT||5000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
