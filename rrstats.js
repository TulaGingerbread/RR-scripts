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
  var cSkill = $('#index_perks').attr('pt')*1;
  if (cSkill == 0) {
    perkUp(function () {
      
    });
  }
  else {
    $('.perk_item[perk="'+config.skill+'"]').click();
    var estTime = $.countdown.periodsToSeconds($('#perk_counter').countdown('getTimes'));
    timer = setTimeout(start, estTime * 1000);
  }
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
  0: 'Сила',
  1: 'Знания',
  2: 'Выносливость'
};
var sstr = '', cstr = '';
for (var c in costs) cstr += '<option value="'+c+'">'+costs[c]+'</option>';
for (var s in skills) sstr += '<option value="'+s+'">'+skills[s]+'</option>';
$("body").append('<div style="position:absolute;width:100%;height:100%;z-index:100;" id="myfc"><form onsubmit="return false;" id="myf" style="width:300px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;">Навык: <select name="skill">'+sstr+'</select><br>Оплата: <select name="cost">'+cstr+'</select><br><button onclick="startJob()">Качать</button><button onclick="cancelJob()">Отменить</button></form></div>');

