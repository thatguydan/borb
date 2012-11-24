var request = require('request');

exports.index = function(req, res){
  res.render('index', { title: 'Ninja Voter' });
};

exports.moderator = function(req, res){

  var coin = (Math.random()>0.5) ? 1 : 0;
  var catId = (coin) ? 49121 : 10472; // Brothel : Bar
  var catName = (coin) ? "Brothel":"Bar";
  // Get question
  var opts = {
    url:'http://api.sensis.com.au/ob-20110511/test/search',
    qs: {
      key:'9pf4p2m9kcc53mcuj5e7s4tu',
      location:'-37.818738,144.957118',
      sensitiveCategories:true,
      categoryId:catId,
      radius:3
    },
    json:true
  }
  request.get(opts,function(e,r,b) {
    var pIx = Math.floor(Math.random()*b.results.length);
    res.render('moderator', {
      debate: b.results[pIx],
      cat: catName,
      title: 'Ninja Moderator'
    });
  });
};


//
// YBF -37.818738,144.957118