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
  }
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
              work(config.maxEnergy, config.success);
              timer = setTimeout(start, (Math.floor(Math.random()*3)+1+10*60)*1000);
            });
          });
        }, 1000);
      });
    }
    else {
      config.fail();
      timer = setTimeout(start, 60*1000);
    }
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
$.ajax({
  url: '/slide/profile/' + id,
  async: false,
  success: function (d) {
    var it = $(d).find('span.tip.pointer');
    var q = isNaN(parseInt(it.eq(0).text())) ? 1 : 0;
    var endurance = parseInt(it.eq(q+2).text());
    config.energyForOne = endurance < 100 ? Math.ceil(19-(endurance+7)/12) : 10;
  }
});
var mentors = {
  0: 'Без наставников',
  1: '1 наставник',
  2: '2 наставника'
};
var rstr = "", mstr = "", tstr = '<option value="0">Сейчас</option>';
for (var r in resources) rstr += '<option value="'+r+'">'+resources[r].highName+'</option>';
for (var m in mentors) mstr += '<option value="'+m+'">'+mentors[m]+'</option>';
for (var i=1; i<11; i++) tstr += '<option value="'+i+'">Через '+i+' минут'+(i==1?'у':i<5?'ы':'')+'</option>';
$("body").append('<div style="position:absolute;width:100%;height:100%;z-index:100;" id="myfc"><form onsubmit="return false;" id="myf" style="width:300px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;">Ресурс: <select name="resource">'+rstr+'</select><br>Наставники: <select name="mentors">'+mstr+'</select><br>Запустить: <select name="delay">'+tstr+'</select><br><input type="checkbox" name="energy_craft">Делать яжку<br><input type="checkbox" name="donate">В бюджет региона <input type="text" name="regionId" maxlength="5" size="5"><br>Кол-во (0 = ∞): <input type="text" name="donateLimit" value="0" size="5"><br><button onclick="startWork()">Работать</button><button onclick="cancelWork()">Отменить</button></form></div>');
