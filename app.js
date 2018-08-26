'use strict';

const uploadPath = 'upload-string-to-gcs/sample.txt';
const uploadUrl = `https://neko-tech-test.appspot.com/${uploadPath}`;

const Storage = require('@google-cloud/storage');
const Readable = require('stream').Readable;

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index', { uploadUrl })
});

const uploadPromise = (text) => {
  return new Promise((resolve, reject) => {
    const storageClient = Storage();
    const bucket = storageClient.bucket(process.env.UPLOAD_BUCKET);

    const uploadFile = bucket.file(uploadPath);
    const uploadStream = uploadFile.createWriteStream({
      predefinedAcl: 'publicRead',
      metadata: {
        cacheControl: 'no-cache',
        contentType: 'text/plain',
      },
    });

    const readStream = new Readable();
    readStream.push(text);
    readStream.push(null);

    readStream
      .on('error', reject)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', resolve);
  });
};


app.post('/', async (req, res) => {
  const body = req.body.text;

  if (typeof body === 'string' && body.length > 0) {
    await uploadPromise(body);
  }

  res.redirect(uploadUrl);
});

app.listen(process.env.PORT || 8080);
