require('dotenv').config()
const express = require('express');
const multer = require('multer');

const path = require('path');

const port = process.env.APP_PORT;
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR);

// inisiasi multer storage
const storage = multer.diskStorage({
    // handler
    destination: (req, file, callback) => {
        callback(null, UPLOAD_DIR);
    },
    // mengambil name 
    filename: (req, file, callback) => {
        const uniqueSuffix = new Date().getTime()
        callback(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`); 
    }
})

// inisiasi midlleware express
const upload = multer({
    storage: storage,
    // filter
    fileFilter: (req, file, callback) => {
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg') {
            return callback(null, true)
        } else {
            callback(null, false)
            return callback(new Error("unsupported file type"))
        }
    }
})

const app = express();


async function uploadHandler (req, res) {
    let res_data = {
        url: `http://localhost:${port}/uploads/${req.file.filename}`
    }
    res.json({
        code: "200",
        status: "OK",
        data: res_data
    })
}

// single uploads
app.post('/image/upload', upload.single('image'), uploadHandler)

// multiple
app.post('/image/uploads', upload.array('image', 10), (req, res) => {
    let urls = [];
    for (let i = 0; i < req.files.length; i++) {
        urls.push(`http://localhost:${port}/uploads/${req.files[i].filename}`)
    }
    let res_data = { 
        url: urls
    } 
    res.json({
        code: "200",
        status: "OK",
        data: res_data
    })
})

// serving file static local
app.get('/uploads/:filename', (req, res) => {
    res.sendFile(path.join(UPLOAD_DIR, req.params.filename))
})

app.use((err, req, res, next) => {
    res.status(400).json({
        code: "400",
        status: "Bad Request",
        message: err.message
    })
})

app.listen(port);