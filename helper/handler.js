/*
* Library for storing and editing data
*
*/

//Dependencies
import fs from 'fs';
const userFilePath = './data/users.json';

// Container for the module to be exported
var lib = {};

let parseJsonToObject = (bufferStr)=>{
    try{
        var obj = JSON.parse(bufferStr);
        return obj;
    }catch(e){
        return {};
    }
}
//Write data to a file
lib.update = (data,callback)=>{
    fs.open(userFilePath,'r+',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data);
            //Truncate the file
            fs.truncate(fileDescriptor,(err)=>{
                if(!err){
                    //write to file and close it
                    fs.writeFile(fileDescriptor,stringData,(err)=>{
                        if(!err){
                            fs.close(fileDescriptor,(err)=>{
                                if(!err){
                                    callback(false);
                                } else{
                                    callback('Error closing while updating File');
                                }
                            });
                        } else{
                            callback('Error on writing to existing file');
                        }
                    });
                } else{
                    callback('Error truncating file');
                }
            })
        } else{
            callback('Could not open the file for updating, it may not exist yet');
        }
    })

}

//Read data from a file
lib.read = (callback)=>{
    fs.readFile(userFilePath,'utf8',(err,data)=>{
        if(!err && data){
            var parsedData = parseJsonToObject(data);
            callback(false, parsedData);
        }
        else{
            callback(err, data);
        }
    })
};

export default lib;
