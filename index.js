const async = require('async');
const fs = require('fs');
const http = require('http');
const mailer = require('nodemailer');
const parse = require('csv-parse/lib/sync');

var emails = ['kayneruse@gmail.com'];

var successEmails = [];
var failureEmails = [];

var transporter;

var textBody;

function getCol(matrix, col){
  var column = [];
  for(var i=0; i<matrix.length; i++){
    column.push(matrix[i][col]);
  }
  return column;
}

function massMailer() {
  var self = this;
  transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'krgamestudios@gmail.com',
      pass: fs.readFileSync('./node.pwd', 'utf8').replace(/^\s+|\s+$/g, ''),
    }
  });
  textBody = fs.readFileSync('./message.txt');
  emails = parse(fs.readFileSync('./addresses.csv'));
  emails = getCol(emails, 1);

//console.log(emails);
  self.invokeOperation();
}

massMailer.prototype.invokeOperation = function() {
  var self = this;
  async.each(emails,self.SendEmail,function() {
    console.log(successEmails);
    console.log(failureEmails);
  });
}

massMailer.prototype.SendEmail = function(email, cb) {
  console.log('Sending to ' + email);
  var self = this;
  self.status = false;
  async.waterfall([
    function(callback) {
      var options = {
        from: 'krgamestudios@gmail.com',
        to: email,
        subject: 'KR Game Studios Update',
        text: textBody
      };
      transporter.sendMail(options, function(err, info) {
        if (err) {
          console.log(err);
          failureEmails.push(email);
        }
        else {
          self.status = true;
          sucessEmail.push(email);
          callback(null,self.status,email);
        }
      });
    }
  ]);
}

new massMailer();
