function fprint(s) {
  var d = new Date();
  var t = [d.getHours(),d.getMinutes(),d.getSeconds()].map(function(i){return i/10|0?i:'0'+i}).join(':');
  console.log(t + ' - ' + s);
}
function rN(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function perkUp(callback) {
  $.ajax({
    url: '/perks/up/' + config.skill + '/' + config.cost,
    data: {c: (new Date()).getTime()},
    success: function () {
      callback();
    },
  });
}
var start = function () {
  perkUp(function () {
    fprint('Попытка вкачать');
  });
  timer = setTimeout(start, 1000*60*5);
};
var stop = function () {
  clearTimeout(timer);
  fprint('Стоп');
};
var config = {};
var timer;
function startJob() {
  $("#myf").serializeArray().map(function(i) {
    config[i.name] = i.value;
  });
  $("#myfc").remove();
  fprint('Качаем ' + skills[config.skill] + ' за ' + costs[config.cost]);
  timer = setTimeout(start, 1000);  
  return false;
}
function cancelJob() {
  $("#myfc").remove();
  return false;
}
var costs = {
  0: 'Бесплатно',
  1: 'Деньги',
  2: 'Голд'
};
var skills = {
  1: 'Сила',
  2: 'Знания',
  3: 'Выносливость'
};
var sstr = '', cstr = '';
for (var c in costs) cstr += '<option value="'+c+'">'+costs[c]+'</option>';
for (var s in skills) sstr += '<option value="'+s+'">'+skills[s]+'</option>';
$("body").append('<div style="position:absolute;width:100%;height:100%;z-index:100;" id="myfc"><form onsubmit="return false;" id="myf" style="width:300px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;">Навык: <select name="skill">'+sstr+'</select><br>Оплата: <select name="cost">'+cstr+'</select><br><button onclick="startJob()">Качать</button><button onclick="cancelJob()">Отменить</button></form></div>');
