'use strict';

const functions = require('firebase-functions');
const {Storage} = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const mm = require('music-metadata');
const util = require('util');
const admin = require('firebase-admin');
const mime = require('mime-types');
//const md5 = require('md5');

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.audioUpload = functions.storage.object().onFinalize((object) => {
    // The Storage bucket that contains the file.
    const fileBucket = object.bucket; 
    // File path in the bucket.
    const filePath = object.name; 
    // File content type.
    const contentType = object.contentType; 
    console.log("Content Type: " + contentType);
    // Number of times metadata has been generated. New objects have a value of 1.
    const metageneration = object.metageneration; 

    // Extension of file type
    var tmpExt = mime.extension(object.contentType);
    const ext  = (contentType === "audio/mpeg") ? "mp3" : tmpExt;

    // Break the string to an array
    var filePathSegments = filePath.split('/'); 
    var handle = filePathSegments.shift(); 

    // Get the file name.
    const fileName = path.basename(filePath);
    
    var gcs = new Storage({
        projectId: 'mgoos-mvp',
        keyFilename: './mgoos-mvp-firebase-adminsdk-5h938-b9fa3122fe.json'
      });
    
    // Download file from bucket.
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName+"."+ext);
    
    var sMetadata;
    var objMetadata;

    return bucket.file(filePath).download({
        destination: tempFilePath,
    }).then(() => {
        console.log('Audio downloaded locally to', tempFilePath);

        return mm.parseFile(tempFilePath, {native: true});
    }).then(metadata => {
        objMetadata = metadata;
        sMetadata = util.inspect(metadata, { showHidden: false, depth: null });
        console.log(sMetadata);
        
        return admin.firestore().collection(`mp3Collection/${handle}/default`)
                    .where("fullPath", "==", filePath)
                    .get();
        
    }).then((querySnapshot) => {
        querySnapshot.forEach(doc => {
            doc.ref.update({'metaData': objMetadata});
        });
        fs.unlinkSync(tempFilePath);

        return writeResult;
    }).catch( err => {
        fs.unlinkSync(tempFilePath);
        console.error("Error: " + err.message);
    });
});
  