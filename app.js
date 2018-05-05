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

let gfs;
conn.once('open', ()=> {
     gfs = Grid(conn.db, mongoose.mongo);
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

   // res.json({file : req.file})
    res.redirect('/')
})

app.get('/files',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length === 0){
            return res.status(404).json({err:'No file exist'})
        }
        res.json(files);
    })


})

app.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({err:'No file exist'});
        }
        res.json(file);

    })


})



app.get('/image/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({err:'No file exist'});
        }
        if(file.contentType==='image/jpeg' || file.contentType==='image/png'){
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
        else{
            return res.status(404).json({err:'No file exist'});
        }

    })


})


app.listen(5000,()=>{
    console.log('server started')
});