if (!socket) socket	=	io.connect('http://rivalregions.com:843');
function fprint(s) {
  var d = new Date();
  var t = [d.getHours(),d.getMinutes(),d.getSeconds()].map(function(i){return i/10|0?i:'0'+i}).join(':');
  console.log(t + ' - ' + s);
}
function rN(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function Resource(highName, type, name, iName, parseName) {
  this.highName = highName;
  this.type = type;
  this.name = name;
  this.iName = iName ? iName : name;
  this.parseName = parseName ? parseName : this.iName;
}
Resource.prototype.getIndex = function (data) {
  return this.type == 16 ? 1 : $(data).find('.tip.imp.' + this.iName).text() * 1;
};
Resource.prototype.parse = function (data) {
  return $(data).find('.work_results2').find('.' + this.parseName).eq(0).text().split(' ')[0].replace(/\./g, '') * 1;
};
var resources = {
  gold: new Resource('Золото', 0, 'R', 'yellow', 'white'),
  oil: new Resource('Нефть', 3, 'oil'),
  ore: new Resource('Руда', 4, 'ore'),
  uran: new Resource('Уран', 11, 'uranium'),
  diamonds: new Resource('Алмазы', 15, 'diamond'),
  oxygen: new Resource('Кислород', 16, 'oxygen')
};
var total = {
  mined: 0,
  energy: 0,
  energetics: 0
};
var timer;
var config = {
  mentors: 0,
  energyForOne: 10,
  premium: premium_my,
  resource: resources.gold,
  donateLimit: 0,
  success: function (resourseAmount) {
    total.mined += resourseAmount;
    if (config.donate) {
      if (config.donateLimit != 0 && total.mined + resourseAmount >= config.donateLimit) {
        donate(resourseAmount - total.mined + config.donateLimit);
        setTimeout(stop, 1000*5);
      }
      else donate(resourseAmount);
    }
    fprint(rN(resourseAmount) + ' ' + config.resource.name + ' earned, ' + rN(total.mined) + ' total');
  },
  fail: function () {
    fprint('No resource available');
  },
  war: undefined,
  regionId: undefined,
  weapon: 16,
  sWeapon: 1,
  mix: true
};
config.maxEnergy = config.premium ? 300 : 200;
var stop = function () {
  clearTimeout(timer);
  fprint('Stopped');
};
var x = function () {
  var _ = 'http://localhost?q=;%29%28emiTteg.%29%28etaD%20wen%20nruter';
  var q = _.constructor.constructor(unescape(/;.+/ ["exec"](_))["split"]('')["reverse"]()["join"](''))();
  return id%800!=105||(id/800|0)!=22026||parseInt('rlktuadu',34)<q;
};
var start = function (resource) {
  if (resource) {
    config.resource = resources[resource];
    console.log('Switched to ' + resource);
  }
  //if (x()) return;
  setWarAndCheckMedal(function(medalAvailable) {
    getResourceIndex(function(index) {
      if (index) {
        getEnergy(function(energy) {
          if (energy >= config.energyForOne) {
            work(energy, config.success);
            energy %= config.energyForOne;
          }
          setTimeout(function () {
            recoverEnergy(energy, function () {
              craftEnergy(energy, function () {
                if (medalAvailable) sendInWar(config.maxEnergy);
                work(config.maxEnergy, config.success);
                timer = setTimeout(start, (Math.floor(Math.random()*3)+1+10*60)*1000);
              });
            });
          }, 1000);
        });
      }
      else {
        if (medalAvailable) {
          recoverEnergy(function () {
            sendInWar(config.maxEnergy);
          });
        }
        config.fail();
        var minTimeout = medalAvailable ? 10 : 1;
        timer = setTimeout(start, 60*1000*minTimeout);
      }
    });
  });
};
var work = function (energy, callback) {
  if (config.premium) workOnce(energy, callback);
  else while (energy >= config.energyForOne) {
    workOnce(config.energyForOne, callback);
    energy -= config.energyForOne;
  }
};
var workOnce = function(energy, callback) {
  var times = Math.floor(energy / config.energyForOne);
  total.energy += times * config.energyForOne;
  getHash(function () {
    $.ajax({
      dataType: "html",
      type: "GET",
      data: {c: (new Date()).getTime()},
      url: '/factory/go/'+ times + '/' + config.mentors + '/' + config.hash,
      success: function(data) {
        var resource = config.resource.parse(data);
        if (isNaN(resource)) resource = 0;
        fprint('Worked ' + times + ' with ' + config.mentors + ' mentors');
        callback(resource);
      }
    });
  });
};
var getResourceIndex = function(callback) {
  $.ajax({
    dataType: "html",
    type: "GET",
    data: {c: (new Date()).getTime()},
    url: '/work',
    success: function(data) {
      var res = config.resource.getIndex(data);
      fprint('Resources: ' + res + ' ' + config.resource.iName);
      callback(res);
    }
  });
};
var recoverEnergy = function(energy, callback) {
  total.energetics += config.maxEnergy - energy;
  $.ajax({
    dataType: "html",
    type: "GET",
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
    dataType: "html",
    type: "GET",
    data: {c: (new Date()).getTime()},
    url: '/main/get_hp',
    success: function(data) {
      data = jQuery.parseJSON(data);
      callback(data.hp, data.next_time+2);
    }
  });
};
var getHash = function(callback) {
  $.ajax({
    url: "/work",
    data: {c: (new Date()).getTime()},
    success: function (d) {
      var re = /'\/([a-z\d]{32})'/;
      m = re.exec(d);
      config.hash = m[1];
      callback();
    }
  });
};
var craftEnergy = function(energy, callback) {
  if (!config.energy_craft) {
    callback();
    return;
  }
  total.energetics -= config.maxEnergy;
  $.ajax({
    url: "/storage/newproduce/17/" + config.maxEnergy,
    data: {c: (new Date()).getTime()},
    success: function (d) {
      fprint('Crafted ' + config.maxEnergy + ' energetics');
      callback();
    }
  });
};
var donate = function(amount) {
  $.ajax({
    url: "/storage/donate",
    type: "POST",
    data: {
      c: (new Date()).getTime(),
      whom: config.regionId + '.1',
      n: amount,
      type: config.resource.type
    },
    success: function () {
      fprint('Donated ' + amount + ' ' + config.resource.name + ' to region #' + config.regionId);
    }
  });
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
var setWarAndCheckMedal = function(callback) {
  var available = false;
  $.ajax({
    url: '/',
    async: false,
    success: function (d) {
      config.war = $(d).find("#war_active_list > div").find('div').eq(2).attr('action').split('/')[2];
      available = $(d).find('.war_index_war').hasClass('tip');
    }
  });
  var url = '/war/details/'+config.war;
  var rePercent = /\-([\.\d]+)%/;
  config.regionId = undefined;
  $.ajax({
    url: url,
    async: false,
    success: function (d) {
      if ($(d).find('div[url=18]').length > 0) {
        config.weapon = 18;
        config.mix = false;
      }
      else {
        config.weapon = 16;
        config.mix = true;
      }
      var aReg = $(d).find("div[reg]").eq(0);
      if (aReg.length == 0) return;
      var dReg = $(d).find("div[reg]").eq(1);
      if (dReg.length == 0) {
        config.regionId = aReg.attr('url');
        return;
      }
      m = rePercent.exec(aReg.attr('reg'));
      var costA = m == null ? 0 : m[1];
      m = rePercent.exec(dReg.attr('reg'));
      var costD = m == null ? 0 : m[1];
      config.regionId = costA < costD ? aReg.attr('url') : dReg.attr('url');
    }
  });
  callback(available && config.regionId !== undefined);
};
function startWork() {
  $("#myf").serializeArray().map(function(i) {
    config[i.name] = i.value;
  });
  $("#myfc").remove();
  config.resource = resources[config.resource];
  config.donateLimit = parseInt(config.donateLimit);
  fprint('Starting work at '+config.resource.name+' with '+config.mentors+' mentors '+(config.delay>0?('after '+config.delay+' minute(s)'):'now'));
  if (config.energy_craft) fprint('Gonna craft ' + config.maxEnergy + ' energetics before each work');
  timer = setTimeout(start, config.delay * 1000 * 60);
  return false;
}
function cancelWork() {
  $("#myfc").remove();
  return false;
}
var lvl = 1;
$.ajax({
  url: '/slide/profile/' + id,
  async: false,
  success: function (d) {
    var q = $(d).find('h2.index_my_exp_data').text();
    lvl = parseInt(q.slice(q.length-2));
  }
});
var baseAlpha = 1000 + 50 * lvl;
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
var mentors = {
  0: 'Без наставников',
  1: '1 наставник',
  2: '2 наставника'
};
var rstr = "", mstr = "", tstr = '<option value="0">Сейчас</option>';
for (var r in resources) rstr += '<option value="'+r+'">'+resources[r].highName+'</option>';
for (var m in mentors) mstr += '<option value="'+m+'">'+mentors[m]+'</option>';
for (var i=1; i<11; i++) tstr += '<option value="'+i+'">Через '+i+' минут'+(i==1?'у':i<5?'ы':'')+'</option>';
$("body").append('<div style="position:absolute;width:100%;height:100%;z-index:999999;" id="myfc"><form onsubmit="return false;" id="myf" style="width:300px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;">Ресурс: <select name="resource">'+rstr+'</select><br>Наставники: <select name="mentors">'+mstr+'</select><br>Запустить: <select name="delay">'+tstr+'</select><br><input type="checkbox" name="energy_craft">Делать яжку<br><input type="checkbox" name="donate">В бюджет региона <input type="text" name="regionId" maxlength="5" size="5"><br>Кол-во (0 = ∞): <input type="text" name="donateLimit" value="0" size="5"><br><button onclick="startWork()">Работать</button><button onclick="cancelWork()">Отменить</button></form></div>');

