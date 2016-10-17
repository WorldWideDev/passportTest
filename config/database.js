// var mongoose = require('mongoose');
// var fs = require('fs');
// var path = require('path');
//
// var connectDB = mongoose.connect('mongodb://localhost/passportTest');
// mongoose.set('debug', true)
// console.log(connectDB);
//
// var models_path = path.join(__dirname, './../app/models');
// console.log(models_path, 'is models folder')
//
// fs.readdirSync(models_path).forEach(function (file){
// 	if(file.indexOf('.js') >= 0){
// 		require(models_path + '/' + file)
// 	}
// })


module.exports = {
    'url': 'mongodb://localhost/passportTest' // looks like mongodbL
}
