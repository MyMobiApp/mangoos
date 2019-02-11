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
    
    // Download file from bucket.
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), uuidv4()+"."+ext);
    
    var sMetadata;
    var objMetadata;

    return bucket.file(filePath).download({
        destination: tempFilePath,
    }).then(() => {
        console.log('Audio downloaded locally to', tempFilePath);

        return mm.parseFile(tempFilePath, {native: true});
    }).then(async metadata => {
        objMetadata = metadata;

        if(objMetadata.common.hasOwnProperty('picture')) {
            await Promise.all(
                objMetadata.common.picture.map(async (obj, index, ary) => {
                    //console.log(obj);
                if(obj.hasOwnProperty('data')) {
                    var imguuid = uuidv4();
                    var imgExt = mime.extension(obj.format);
                    //console.write(imgExt);
                    fs.createWriteStream(os.tmpdir()+'/'+imguuid+'.'+imgExt).write(obj.data);
                    
                    var file = await bucket.upload(os.tmpdir()+'/'+imguuid+'.'+imgExt, {
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
                    objMetadata.common.picture[index].data = `coverImages/${imguuid}.${imgExt}`;
                    
                    // signedUrls[0] contains the file's public URL
                    /*objMetadata.common.picture[index].data = await file[0].getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491'
                    });*/

                    console.log("-------------------(1)-------------------");
                    console.log(objMetadata.common.picture);

                }
            }));
        }
        objMetadata.native = null;
        console.log("-------------------(2)-------------------");
        console.log(objMetadata.common.picture);

        sMetadata = util.inspect(metadata, { showHidden: false, depth: null });
        //console.log(sMetadata);
        
        return admin.firestore().collection(`mp3Collection/${handle}/default`)
                    .where("fullPath", "==", filePath)
                    .get();
        
    }).then((querySnapshot) => {
        console.log("-------------------(3)-------------------");
        console.log(objMetadata.common.picture);

        querySnapshot.forEach(doc => {
            doc.ref.update({'metaData': objMetadata});
        });

        try{
            fs.unlinkSync(tempFilePath);
        }
        catch(error) {
            console.log("Error removing temp file: "+ error.message)
        }

        return 1;
    }).catch( err => {
        try{
            fs.unlinkSync(tempFilePath);
        }
        catch(error) {
            console.log("Error removing temp file: "+ error.message)
        }
        
        console.error("Error: " + err.message);
    });
});

/*
exports.fileMaintenance = functions.https.onCall((data, context) => {
    // Message text passed from the client.
    //const text = data.text;
    // Authentication / user information is automatically added to the request.
    //const uid = context.auth.uid;
    //const name = context.auth.token.name || null;
    //const picture = context.auth.token.picture || null;
    //const email = context.auth.token.email || null;
    // fileMaintenance(1,2)

    const fileBucket = "mgoos-mvp.appspot.com";

    var gcs = new Storage({
        projectId: 'mgoos-mvp',
        keyFilename: './mgoos-mvp-firebase-adminsdk-5h938-b9fa3122fe.json'
      });
    const bucket = gcs.bucket(fileBucket);

    admin.firestore().collection('mp3Collection/manish_mastishka.hotmail.com/default/')
        .get()
        .then((querySnapshot) => {
                querySnapshot.forEach( async (doc) => {
                    //console.log(doc.data());
                    //if(false)
                    try {
                        if(doc.data().hasOwnProperty('metaData') &&
                        doc.data().metaData.hasOwnProperty('common') &&
                        doc.data().metaData.common.hasOwnProperty('picture') &&
                        doc.data().metaData.common.picture[0].hasOwnProperty('data')) {
                            let imgFile = bucket.file(encodeURI(doc.data().metaData.common.picture[0].data));
                            const coverImg = await imgFile.getSignedUrl({
                                action: 'read',
                                expires: '03-09-2491'
                            });
                            //doc.ref.update({'coverImg': coverImg});
                            console.log("CoverImage: " + coverImg);
                        }

                        let musicFile = bucket.file(encodeURI(doc.data().fullPath));
                        const musicUrl = await musicFile.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2491'
                        });
                        //doc.ref.update({'musicUrl': musicUrl});
                        console.log("Music URL: " + musicUrl);
                    }
                    catch(error) {
                        console.log(error);
                    }
                });
        }).catch(error => {
            console.log(error);
        });
});
*/