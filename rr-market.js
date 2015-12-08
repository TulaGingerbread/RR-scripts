function getMarketData(productId) {
  var data = {};
  var url = "/storage/listed/" + productId;
  $.ajax({
    url: url,
    async: false,
    data: {c:(new Date()).getTime()},
    success: function (d) {
      $(d).find("tr").each(function (i, e) {
        if (i == 0) return;
        var tds = $(e).find("td");
        var offer = {
          user: $(e).attr('user'),
          amount: tds.eq(2).attr('rat'),
          price: tds.eq(3).attr('rat')
        };
        data[i] = offer;
      });
    }
  });
  return data;
}

