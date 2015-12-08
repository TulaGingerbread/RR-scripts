function getTopPlayers(amount) {
  var k = Math.ceil(amount / 25);
  var userIDs = [], users = [];
  for (var i = 0; i < k; i++) {
    userIDs = userIDs.concat(get25PlayersFrom(25 * i));
  }
  userIDs.splice(amount);
  userIDs.forEach(function (id) {
    users.push(getUserStats(id));
  });
  console.log("All done");
  users.exportTop = function (criteria, amount) {
    this.sort(function (u1, u2) {
      return u2[criteria] - u1[criteria];
    });
    var str = "Name," + criteria.toUpperCase() + "\n";
    for (var i = 0; i < amount; i++) {
      str += this[i].name + "," + this[i][criteria] + "\n";
    }
    return str;
  }
  return users;
}
var regUserMatch = new RegExp('user=\\"(\\d+)\\"', 'g');
function get25PlayersFrom(start) {
  var result = [];
  var url = "/listed/region/0/0/" + start;
  $.ajax({
    url: url,
    success: function (d) {
      var m;
      do {
        m = regUserMatch.exec(d);
        if (m) result.push(m[1]);
      } while (m);      
    },
    async: false,
  });
  return result;
}
function getUserStats(id) {
  var user = {id: id};
  var url = "/slide/profile/" + id;
  $.ajax({
    url: url,
    success: function (d) {
      var it = $(d).find('span.tip.pointer');
      var q = isNaN(parseInt(it.eq(0).text())) ? 1 : 0;
      user.strength = parseInt(it.eq(q).text());
      user.education = parseInt(it.eq(q+1).text());
      user.endurance = parseInt(it.eq(q+2).text());
      user.sum = user.strength + user.education + user.endurance;
      user.name = $(d).find('h1.white > div').eq(0).text().split(':')[1].trim();
      user.lvl = parseInt($(d).find('h2.index_my_exp_data').text().split(' ')[2].slice(0,-1));
      user.alpha = Math.floor((1000 + user.lvl * 50) * (user.lvl + user.strength + user.sum) / 200);
      user.mindmg = 50 * Math.ceil(0.875 * (1000 + user.lvl * 50) * (0.25 + (user.lvl + user.strength + user.sum) / 200));
      user.maxdmg = 50 * Math.ceil(1.125 * (1000 + user.lvl * 50) * (3.25 + (user.lvl + user.strength + user.sum) / 200));
      user.avgdmg = (user.mindmg + user.maxdmg) / 2;
      user.discount = (Math.sqrt(user.strength) + Math.sqrt(user.education)).toFixed(3);
      console.log("Got stats for " + user.name);
    },
    async: false,
  });
  return user;
}