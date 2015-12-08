var factoryId = 8681;
var salary = "99";
var url = '/factory/customsalary/'+factoryId;
var ids = [];
$("#list_tbody").find('tr[user]').each(function(){
  var id = $(this).attr('user');
  $.ajax({
    type: "POST",
    url: url,
    data: {
      type: "1",
      who: id,
      salary: salary,
      c: (new Date()).getTime()
    }
  });
});
