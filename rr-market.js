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
function Product(id, name) {
  this.id = id;
  this.name = name;
  this.data = getMarketData(id);
}
Product.prototype.refreshData = function () {
  this.data = getMarketData(id);
};
Product.prototype.getLowestPrice = function () {
  return +this.data[1].price;
};
Product.prototype.getRealPrice = function () {
  var avg = 0;
  for (var i = 1; i < 5; i++) {
    avg += this.data[i].price;
  }
  avg /= 5;
  return avg;
};
var products = {
  3: new Product(3, 'Oil'),
  4: new Product(4, 'Ore'),
  11: new Product(11, 'Uran'),
  15: new Product(15, 'Diamonds')
};
