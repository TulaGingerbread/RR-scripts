var config = {
  capital: parseInt($('span.dot[action^="map/details"]').attr('action').split('/')[2]),
  user: id
};
function fprint(s) {
  var d = new Date();
  var t = [d.getHours(),d.getMinutes(),d.getSeconds()].map(function(i){return i/10|0?i:'0'+i}).join(':');
  console.log(t + ' - ' + s);
}
function rN(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function ct() {
  return (new Date()).getTime();
}
function Resource(highName, type, iName, maxMargin, dayLimit) {
  this.highName = highName;
  this.type = type;
  this.iName = iName;
  this.maxMargin = maxMargin;
  this.dayLimit = dayLimit;
}
Resource.prototype.getIndex = function (data) {
  return $(data).find('[class="imp ' + this.iName + '"]').text() * 1;
};
var resources = {
  0: new Resource('Золото', 0, 'yellow', 670, 1200),
  3: new Resource('Нефть', 3, 'oil', 389, 1000),
  4: new Resource('Руда', 4, 'ore', 374, 800),
  11: new Resource('Уран', 11, 'uranium', 26, 100),
  15: new Resource('Алмазы', 15, 'diamond', 27, 100)
};
function Region(id) {
  this.id = id;
  this.updateTime = 0;
  this.updateHTML();
  var title = $(this.html).find("h1.slide_title").text().trim();
  var re = /(регион|автономия) (.+?)( и еще|\u25b6$)/;
  var m = re.exec(title);
  this.name = m == null ? this.id : m[2];
  this.refreshResources();
}
Region.prototype.updateHTML = function () {
  if ((ct() - this.updateTime) < 1000 * 60 * 3) return;
  var url = '/map/details/' + this.id;
  var data;
  $.ajax({
    url: url,
    async: false,
    success: function (html) {
      data = html;
    }
  });
  this.html = data;
  this.updateTime = ct();
};
Region.prototype.refreshResources = function () {
  this.updateHTML();
  this.resources = {};
  var re1 = new RegExp("(\\d+\\.\\d+)\\/(\\d+)");
  var re2 = new RegExp("\\(([+-]?\\d+)\\)");
  var re3 = new RegExp("(\\d+)\\/\\d+");
  for (var r in resources) {
    var res = resources[r];
    var elem = $(this.html).find("#region_scroll div.short_details.imp."+res.iName); 
    var strRes = elem.text().trim();
    var strLimit = elem.find('span').eq(0).attr('title');
    try {
      var m1 = re1.exec(strRes);
      var m2 = re2.exec(strRes);
      var m3 = re3.exec(strLimit);
      var resData = {
        current: parseFloat(m1[1]),
        maximum: parseInt(m1[2]),
        deepExp: parseInt(m2[1]),
        limit: res.dayLimit - parseInt(m3[1])
      };
    }
    catch (e) {
      fprint('Ошибка при парсинге ресурса: ' + res.highName);
    }
    this.resources[res.type] = resData;
  }
};
Region.prototype.getCurrentResource = function (resource) {
  return Math.ceil(this.resources[resource.type].current);
};
Region.prototype.getMaxResource = function (resource) {
  return this.resources[resource.type].maximum;
};
Region.prototype.getDeepExp = function (resource) {
  return this.resources[resource.type].deepExp;
};
Region.prototype.getCurrentLimit = function (resource) {
  return this.resources[resource.type].limit;
};
Region.prototype.exploration = function (resource) {
  var amount = this.getMaxResource(resource) - this.getCurrentResource(resource);
  var currentLimit = this.getCurrentLimit(resource);
  if (amount > currentLimit) {
    amount = currentLimit;
    fprint('Достигнут предел разведок ' + resource.highName + ' в регионе #' + this.id + ' (' + this.name + ')');
  }
  if (amount < 8 && (amount != currentLimit || amount == 0)) return;
  var lawUrl = '/parliament/donew/18/' + resource.type + '_' + amount + '/' + this.id;
  createLawAndVote(lawUrl, function (reg) {
    fprint('Разведка на ' + amount + ' ' + resource.highName + ' в регионе #' + reg.id + ' (' + reg.name + ') проведена');
  }(this));
};
Region.prototype.deepExploration = function (resource) {
  var amount = resource.maxMargin - this.getMaxResource(resource);
  if (amount == 0) return;
  var lawUrl = '/parliament/donew/34/' + resource.type + '_' + amount + '/' + this.id;
  createLawAndVote(lawUrl);
  fprint('Глубокая разведка на ' + amount + ' ' + resource.highName + ' в регионе #' + reg.id + ' (' + reg.name + ') проведена');
};
function createLawAndVote(lawUrl) {
  var lawTime = ct();
  $.ajax({
    type: "POST",
    url: lawUrl,
    data: {c: lawTime},
    success: function (res, status, xhr) {
      lawTime = new Date(xhr.getResponseHeader("Date")).getTime();
      var voteUrl = '/parliament/votelaw/' + config.capital + '/' + config.user + '/' + lawTime.toString().slice(0,-3) + '/pro/';
      $.ajax({
        type: "POST",
        url: voteUrl,
        data: {c: ct()},
        success: function (data) {}
      });
    }
  });  
}
var regions = {};
function findOrCreateRegion(id) {
  if (regions[id] === undefined) regions[id] = new Region(id);
  if (regions[id].html == "") {
    fprint('Региона #' + this.id + ' не существует!');
  }
  return regions[id];
}
function Exploration(expl, counter) {
  this.type = expl.type;
  this.region = findOrCreateRegion(expl.region);
  this.resource = resources[expl.resource];
  this.id = counter;
}
Exploration.prototype.isDeep = function () {
  return this.type == 1;
};
Exploration.prototype.perform = function () {
  fprint('Разведка: ' + this.toString());
  this.region.refreshResources();
  if (this.isDeep()) this.region.deepExploration(this.resource);
  else this.region.exploration(this.resource);
};
Exploration.prototype.toString = function () {
  return this.region.name + " — " + this.resource.highName;
};
Exploration.prototype.toExport = function () {
  return {
    type: this.type,
    region: this.region.id,
    resource: this.resource.type
  };
};
var timer;
var explCounter = 0;
var explorations = {};
var loop = function () {
  fprint('Начинаем цикл разведок');
  for (var i in explorations) {
    var expl = explorations[i];
    (function (i, expl) {
      setTimeout(function () {
        expl.perform();
      }, 1000*5*i);
    }(i, expl));
  }
  timer = setTimeout(loop, 10*60*1000);  
};
var stop = function () {
  clearTimeout(timer);
  $("#myfc").remove();
  fprint('Министерство закрыто');
};
timer = setTimeout(loop, 10*1000);
var rstr = '';
for (var r in resources) rstr += '<option value="'+resources[r].type+'">'+resources[r].highName+'</option>';
var createExploration = function () {
  var expl = {};
  $("#myf_ne").serializeArray().map(function(i) {
    expl[i.name] = i.value;
  });
  addExploration(expl);
  $("#myf_ne").remove();
};
var addExploration = function (expl) {
  var exploration = new Exploration(expl, explCounter);
  explorations[explCounter++] = exploration;
  var divSel = exploration.isDeep() ? "#cur_deep_expl" : "#cur_expl";
  $(divSel).append('<li id="expl_' + exploration.id + '">' + exploration.toString() + ' <button onclick="removeExploration(' + exploration.id + ')">x</button></li>');
};
var removeExploration = function (id) {
  delete explorations[id];
  $("li#expl_"+id).remove();
};
var newExploration = function () {
  $("#myf").append('<form onsubmit="return false;" id="myf_ne">Тип: <input name="type" type="radio" checked="checked" value="0">Обычная <input name="type" type="radio" value="1">Глубокая<br>Регион: <input type="text" name="region" placeholder="id"><br>Ресурс: <select name="resource">'+rstr+'</select><br><button onclick="createExploration()">Добавить</button></form>');
};
var exportConfig = function () {
  var c = [];
  for (var i in explorations) {
    c.push(explorations[i].toExport());
  }
  fprint('Выполните следующий код после запуска скрипта, чтобы импортировать конфигурацию:');
  console.log("importConfig(JSON.parse('"+JSON.stringify(c)+"'));");
};
var importConfig = function (explArray) {
  for (var i in explArray) {
    addExploration(explArray[i]);
  }
};
$("body").append('<div style="position:absolute;width:100%;height:100%;background-color:rgba(0,0,0,0.8);z-index:999999;" id="myfc"><form onsubmit="return false;" id="myf" style="width:600px;margin:100px auto;padding:15px;background-color:white;border:1px solid black;"><h2>Министерство экономики</h2><hr><h4>Текущие разведки</h4><ul id="cur_expl"></ul><h4>Текущие глубокие разведки</h4><ul id="cur_deep_expl"></ul><button onclick="newExploration()">Добавить разведку</button><button onclick="exportConfig()">Экспортировать</button></form></div>');
