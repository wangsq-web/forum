
module.exports = function(mingwen){
  var crypto = require('crypto');
  let hash = crypto.createHmac('sha256', mingwen).digest('hex');
  return hash
}