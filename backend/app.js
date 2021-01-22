var express = require('express');
const cors = require("cors");
const multer = require('multer');
const fs = require('fs');
const convert = require('heic-convert');
const path = require('path');
const Admzip = require('adm-zip');
const zipper = new Admzip();

let rootFile = path.basename(__dirname+'./public');
let resultFile = path.basename(__dirname+'./result');

let app = express();
app.use(express.static(__dirname+'public'));
app.use(express.urlencoded({extended: false}));
app.use(cors());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' +file.originalname )
    }
});

var upload = multer({ storage: storage }).array('files')


async function singleImageConvert(inputBuffer){
    const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1
    });
    return outputBuffer;
}

async function writeBufferToFile(outputBuffer, i){
    let message = "";
    await fs.writeFile(resultFile+`/${i}.jpg`, outputBuffer, (err) =>{
        if(err){
            return err;
        } else{
            message = "All good, no errors";
            return message;
        }
    })
}

async function convertAnImage(){
    let messages = [];
    await fs.readdir(rootFile, async(err, files)=>{
        if(err){
            return err;
        }
        else{
            let counter = 0;
            for(let i = 0; i < files.length; i++){
                name = files[i];
              await fs.readFile(rootFile + '/'+name, async (err, data) =>{
                    let buffer = await singleImageConvert(data);
                    messages [i] = await writeBufferToFile(buffer, i);
                })
            }
        }
    })
}

function zipImages() {
    fs.readdir(rootFile, async (err, filenames)=>{
        for(let i = 0; i < filenames.length; i++){
            let name = filenames[i];
            fs.unlinkSync(rootFile + '/' + name);
        }
    })
    zipper.addLocalFolder('./result', 'convertedImages');
    fs.writeFileSync('output.zip', zipper.toBuffer());
    zipper.writeZip('output.zip');
    fs.readdir(resultFile, async (err, filenames)=>{
        for(let i = 0; i < filenames.length; i++){
            let name = filenames[i];
            fs.unlinkSync(resultFile + '/' + name);
        }
    })
}


app.get('/', (req, res) =>
    res.send("This is an Image Format converter Web App")
);

app.post('/upload',function(req, res) {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.files)

    })

});


app.get('/convert', function(req, res){

    convertAnImage().then(r => {

    })

    res.status(200).send("Converting Files... Wait for few minutes before downloading");

})


app.get('/download', function(req,res){
    zipImages();
    res.sendFile(__dirname+'/output.zip')
})


app.listen(5050, function(){
    console.log('backend is running on port 5050');
});
