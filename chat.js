// me -> shevchik
// 5:::{"name":"rr_chat","args":["{\"text\":\"12349876\", \"nome\":\"0\", \"id\":\"17620905\", \"lang_id\":\"0\", \"hash\":\"8e26ab38acdc4b5274ede9c8a921dcee\", \"room\":\"u14708672u_u17620905u\"}"]}

// me -> global
// 5:::{"name":"rr_chat","args":["{\"text\":\"%u0432%u0441%u0435%u043C%20%u043F%u0440%u0438%u0432%u0435%u0442%2C%20%u043A%u0430%u043A%20%u0434%u0435%u043B%u0430%20%u0443%20%u0432%u0430%u0441%2C%20%u0447%u0435%u0433%u043E%20%u043C%u043E%u043B%u0447%u0438%u0442%u0435%3F\", \"nome\":\"1\", \"id\":\"17620905\", \"lang_id\":\"0\", \"hash\":\"8e26ab38acdc4b5274ede9c8a921dcee\", \"room\":\"0\"}"]}

var message = "всем привет";
var id = '192852686';
var hash = 'e4ca100d3e45f4afe6b43f8d98621255';
function sendInGlobalChat(id, hash, message) {
  var conf = {
    text: message,
    id: id,
    hash: hash,
    room: '0',
    nome: '1',
    lang_id: '0'
  };
  socket.emit('rr_chat', JSON.stringify(conf));
}

var from = '14708672';
var to = '17620905';
var hash = '1cd9c643b112450ded7718459de76e44';
var message = 'fu';
function sendPM(from, to, hash, message) {
  var sId = from < to ? from : to;
  var gId = from < to ? to : from;
  var roomId = 'u'+sId+'u_u'+gId+'u';
  var conf = {
    text: message,
    nome: '0',
    id: from,
    lang_id: '0',
    hash: hash,
    room: roomId
  };
  socket.emit('rr_chat', JSON.stringify(conf));
}
