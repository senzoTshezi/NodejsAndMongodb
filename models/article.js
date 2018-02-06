//Mongoose give us ability to structure our Data in application level 
 const mongoose = require ('mongoose');

 const articleSchema = mongoose.Schema({
     title:{
         type:String,
         required: true
     },
     author: {
         type: String,
         required: true 
     },
     body:{
         type: String,
         required:true 
     }
 });

 let Article = module.exports= mongoose.model('Article', articleSchema);