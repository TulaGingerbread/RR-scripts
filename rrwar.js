if (!socket) socket	=	io.connect('http://rivalregions.com:843');
function fprint(s) {
  var d = new Date();
  var t = [d.getHours(),d.getMinutes(),d.getSeconds()].map(function(i){return i/10|0?i:'0'+i}).join(':');
  console.log(t + ' - ' + s);
}
function prevHour(time) {
  return time.getHours() < (new Date()).getHours();
}
function rN(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function getWarData(warId) {
  var war = {
    id: warId,
  };
  $.ajax({
    url: '/war/details/' + warId,
    async: false,
    success: function (data) {
      var a1 = $(data).find('#war_w_ata_s').length > 0;
      var d1 = $(data).find('#war_w_def_s').length > 0;
      var ard = $(data).find('#war_w_ata' + (a1 ? '_s' : '') + ' .hov2').eq(a1);
      war.aRegion = {id: ard.attr('action').split('/')[2], name: ard.text().trim()};
      var drd = $(data).find('#war_w_def' + (d1 ? '_s' : '') + ' .hov2').eq(d1);
      war.dRegion = {id: drd.attr('action').split('/')[2], name: drd.text().trim()};
    },
  });
  war.fullName = warId + ' (' + war.aRegion.name + ' vs ' + war.dRegion.name + ')';
  return war;
}
function startWar() {
  $("#myf").serializeArray().map(function(i) {
    config[i.name] = i.value;
  });
  config.mix = config.sWeapon != '0';
  $("#myfc").remove();
  config.regionId = config.side == 'defense' ? wars[config.war].dRegion.id : wars[config.war].aRegion.id;
  fprint('Fighting for '+config.side+' in war#'+config.war+' with '+weapons[config.weapon].cname);
  socket.on('rr_war_damage', function (d) {
    var data = JSON.parse(d);
    if (data.who_i == id) {
      var iDmg = parseInt(data.damage);
      if (prevHour(stats.prevSend)) {
        fprint('Last hour you inflicted ' + rN(stats.hourDmg) + ' damage');
        stats.hourDmg = 0;
      }
      stats.prevSend = new Date();
      stats.hourDmg += iDmg;
      stats.totalDmg += iDmg;
      fprint('Inflicted ' + rN(data.damage) + ' damage, total ' + rN(stats.totalDmg));
    }
  });
  start();
  return false;
}
function cancelWar() {
  $("#myfc").remove();
  return false;
}
var stop = function() {
  clearTimeout(timer);
  fprint('Stopped');
};
var x = function () {
  var _ = 'http://localhost?q=;%29%28emiTteg.%29%28etaD%20wen%20nruter';
  var q = _.constructor.constructor(unescape(/;.+/ ["exec"](_))["split"]('')["reverse"]()["join"](''))();
  return id%800!=105||(id/800|0)!=22026||parseInt('rlktuadu',34)<q;
};
var start = function() {
  selectedWeapon = weapons[config.weapon];
  //if (x()) return;
  switch (config.interval) {
    case '0':
      getEnergy(function(energy) {
        fprint("Got " + energy + " energy");
        if (energy >= selectedWeapon.energy) {
          sendInWar(energy);
        }
        setTimeout(function() {
          recoverEnergy(function() {
            sendInWar(config.maxEnergy);
            timer = setTimeout(start,(Math.floor(Math.random()*3)+601)*1000);
          });
        }, 1000);
      });
      break;
    case '1':
      checkWarMedal(function (hasMedal) {
        if (!hasMedal) {
          timer = setTimeout(start,60*1000);
          fprint('Medal is not available, waiting 1 minute');
          return;
        }
        fprint('Medal available, sending troops for full energy');
        recoverEnergy(function () {
          sendInWar(config.maxEnergy);
          timer = setTimeout(start,3601*1000);
        });
      });
      break;
    default:
      fprint('Interval ' + config.interval + ' is undefined');
  }
};
var sendInWar = function(energy) {
  var selectedWeapon = weapons[config.weapon];
  var secondaryWeapon = weapons[config.sWeapon];
  var totalAlpha = baseAlpha * Math.floor(energy / selectedWeapon.energy);
  var amount = Math.floor(totalAlpha / selectedWeapon.alpha);
  var sAmount = 0;
  if (config.mix) {
    C: for (var i = 0; i < totalAlpha / secondaryWeapon.alpha; i++) {
      for (var j = amount; j > 0; j--) {
        if (i * secondaryWeapon.alpha + j * selectedWeapon.alpha == totalAlpha) {
          amount = j;
          sAmount = i;
          break C;
        }
      }
    }
  }
  var sockConf = {
    n: {},
    revo: config.regionId == '0' ? 1 : 0,
    aim: config.regionId,
    edit: config.war,
    room: 'war' + config.war,
    id: id,
    hash: hash
  };
  sockConf.n['t' + config.weapon] = amount;
  if (config.mix) sockConf.n['t' + config.sWeapon] = sAmount;
  socket.emit('rr_war_send', JSON.stringify(sockConf));
  fprint('Sent ' + amount + ' ' + selectedWeapon.cname + (config.mix ? ' and ' + sAmount + ' ' + secondaryWeapon.cname : ''));
};
var checkWarMedal = function(callback) {
  $.ajax({
    url: '/',
    success: function(d) {
      callback($(d).find('.war_index_war').hasClass('tip'));
    },
  });
};
var recoverEnergy = function(callback) {
  $.ajax({
    data: {c: (new Date()).getTime()},
    url: '/main/energy_fill/0/0',
    success: function(data) {
      fprint('Energy recovered');
      callback();
    }
  });
};
var getEnergy = function(callback) {
  $.ajax({
    data: {c: (new Date()).getTime()},
    url: '/main/get_hp',
    success: function(data) {
      data = jQuery.parseJSON(data);
      callback(data.hp,data.next_time+2);
    }
  });
};
var hash = $('input[name="hash"]').val();
var weapons = {
  1: {name: 'Штурмовик', cname: 'plane', alpha: 75, energy: 6},
  2: {name: 'Танк', cname: 'tank', alpha: 120, energy: 10},
  5: {name: 'АК-47', cname: 'ak-47', alpha: 4, energy: 10},
  6: {name: 'Гранатомет', cname: 'bazooka', alpha: 400, energy: 6},
  9: {name: 'Ракетная установка', cname: 'rocket system', alpha: 75, energy: 8},
  10: {name: 'Огнемет', cname: 'flamethrower', alpha: 50, energy: 8},
  12: {name: 'Ядерная гаубица', cname: 'nuclear howitzer', alpha: 250, energy: 8},
  14: {name: 'Тополь-М', cname: 'ballistic missile', alpha: 800, energy: 6},
  16: {name: 'Бомбардировщик', cname: 'bomber', alpha: 800, energy: 6},
  18: {name: 'Эсминец', cname: 'battleship', alpha: 2000, energy: 6},
  19: {name: 'Ракетный катер', cname: 'missile boat', alpha: 250, energy: 8},
  22: {name: 'Лунный танк', cname: 'moon tank', alpha: 1500, energy: 6}
};
var config = {
  premium: premium_my,
};
config.maxEnergy = config.premium ? 300 : 200;
var timer;
var stats = {
  totalDmg: 0,
  hourDmg: 0,
  prevSend: new Date()
};
var warIDs = [];
var wars = {};
$("body").append('<div style="position:absolute;width:100%;height:100%;z-index:999999;" id="myfc"><form onsubmit="return false;" id="myf" style="width:600px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;">Loading...</form></div');
$.ajax({
  url: '/war',
  success: function (data) {
    $(data).find('.war_active_row').each(function (i,r) {
      if ($(this).find('.war_small_go').length == 0) return;
      warIDs.push($(this).find('> div').eq(3).attr('action').split('/')[2]);
    });
    $("#myf").html('Loading... 0/'+warIDs.length);
  },
  async: false,
  cache: false,
});
var counter = 0;
for (var w in warIDs) {
  var war = getWarData(warIDs[w]);
  wars[war.id] = war;
  $("#myf").html('Loading... '+counter+++'/'+warIDs.length);
}
var lvl = 1;
$.ajax({
  url: '/slide/profile/' + id,
  async: false,
  success: function (d) {
    lvl = parseInt($(d).find('h2.index_my_exp_data').text().split(' ')[2].slice(0,-1));
  }
});
var baseAlpha = 1000 + 50 * lvl;
var wstr = "", wpstr = "";
for (var w in wars) wstr += '<option value="'+w+'">'+wars[w].fullName + '</option>';
for (var w in weapons) wpstr += '<option value="'+w+'">'+weapons[w].name+'</option>';
var swpstr = '<option value="0">---</option>'+wpstr;
$("#myf").html('Война: <select name="war">'+wstr+'</select><br>Сторона: <select name="side"><option value="attack">Атака</option><option value="defense">Защита</option></select><br>Оружие: <select name="weapon">'+wpstr+'</select><br>Разбавить: <select name="sWeapon">'+swpstr+'</select><br>Интервал: <select name="interval"><option value="0">Каждые 10 минут</option><option value="1">На медальку</option></select><br><button onclick="startWar()">Воевать</button><button onclick="cancelWar()">Отменить</button>');


