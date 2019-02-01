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
const base64Img = require('base64-img');
const uuidv4 = require('uuid/v4');
//var FileReader = require('filereader');
//const md5 = require('md5');

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const settings = {/* your settings... */ timestampsInSnapshots: true};
admin.firestore().settings(settings);

exports.audioUpload = functions.storage.object().onFinalize( (object) => {

    // The Storage bucket that contains the file.
    const fileBucket = object.bucket; 
    // File path in the bucket.
    const filePath = object.name; 
    if(filePath.search('coverImages') >= 0 ){
        return;
    }
    // File content type.
    const contentType = object.contentType; 
    console.log("Content Type: " + contentType + " - File Bucket: " + fileBucket);
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
    
    const  ciBucket = gcs.bucket(fileBucket);
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

        if(objMetadata.common.hasOwnProperty('picture')) {
            objMetadata.common.picture.forEach(async (obj, index, ary) => {
                if(obj.hasOwnProperty('data')) {
                    var imguuid = uuidv4();
                    var imgExt = mime.extension(obj.format);
                    //console.write(imgExt);
                    fs.createWriteStream(os.tmpdir()+'/'+imguuid+'.'+imgExt).write(obj.data);
                    /*
                    var reader = new FileReader();
                    reader.readAsDataURL(obj.data); 
                    var base64data;
                    reader.onloadend = await function() {
                        base64data = reader.result;
                    };
                    
                    base64Img.imgSync('data:'+obj.format+';base64,' + base64data, os.tmpdir(), imguuid);
                    */
                    var file = await ciBucket.upload(os.tmpdir()+'/'+imguuid+'.'+imgExt, {
                        destination: 'coverImages/'+imguuid+'.'+imgExt,
                        // Support for HTTP requests made with `Accept-Encoding: gzip`
                        gzip: true,
                        metadata: {
                        // Enable long-lived HTTP caching headers
                        // Use only if the contents of the file will never change
                        // (If the contents will change, use cacheControl: 'no-cache')
                        cacheControl: 'public, max-age=31536000',
                        },
                    });
                    ary[index].data = `coverImages/${imguuid}.${imgExt}`;
                }
            });
        }
        objMetadata.native = null;

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
  