// Load a text resource from a file over the network
var loadResource = function(info,callback){
  if(info == null) return callback(null,null);
  if(info.length!==2) return callback("Info is not completed" + info);
  switch (info[0]) {
    case "text":
      loadTextResource(info[1],callback);
      break;
    case "image":
      loadImage(info[1],callback);
      break;
    case "json":
      loadJSONResource(info[1],callback);
      break;
    default:
      loadTextResource(info[1],callback);
  }
};


var loadTextResource = function (url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url , true);
  request.onload = function () {
    if (request.status < 200 || request.status > 299) {
      callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
    } else {
      callback(null, request.responseText);
    }
  };
  request.send();
};

var loadImage = function (url, callback) {
  var image = new Image();
  image.onload = function () {
    callback(null, image);
  };
  image.src = url;
};

var loadJSONResource = function (url, callback) {
  loadTextResource(url, function (err, result) {
    if (err) {
      callback(err);
    } else {
      try {
        var x = JSON.parse(result);

      } catch (e) {
        return callback(e);
      }
      callback(null, x);
    }
  });
};
