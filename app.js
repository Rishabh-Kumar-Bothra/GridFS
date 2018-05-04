const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


var app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'));


app.set('view engine','ejs');

const mongoURI = "mongodb://grid:12345@ds115420.mlab.com:15420/mongouploads";

const conn = mongoose.createConnection(mongoURI);

conn.once('open', ()=> {
    var gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})


const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    });
}
});
const upload = multer({ storage });

app.get('/',(req,res)=>{
    res.render('index')
});

app.post('/upload',upload.single('file'),(req,res)=>{

    res.json({file : req.file})
})


app.listen(5000,()=>{
    console.log('server started')
});