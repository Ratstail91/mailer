const async = require('async');
const fs = require('fs');
const http = require('http');
const mailer = require('nodemailer');
const parse = require('csv-parse/lib/sync');

var emails = [];

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

  async.each(emails, self.SendEmail, function(cb) {
//console.log('MARK 3');
    console.log('Success:', successEmails);
    console.log('Failure:', failureEmails);
  });
}

massMailer.prototype.SendEmail = function(email, cb) {
  var self = this;

  console.log('Sending to ' + email);

  async.waterfall([
    function(callback) {
//console.log('MARK 0');
      var options = {
        from: 'krgamestudios@gmail.com',
        to: email,
        subject: 'KR Game Studios Update',
        text: textBody
      };

      transporter.sendMail(options, function(err, info) {
        if (err) {
          failureEmails.push(email);
        }
        else {
//console.log('MARK 1');
          successEmails.push(email);
        }
        callback();
      });
    },
    function() {
//console.log('MARK 2');
      cb();
    }
  ]);
}

new massMailer();
