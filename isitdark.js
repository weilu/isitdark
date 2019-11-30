const autoOffPath = '/cgi-bin/scripts.cgi?cmd=stop&script=auto-night-detection'
const irCutOnPath = '/cgi-bin/action.cgi?cmd=ir_cut_on'
const irCutOffPath = '/cgi-bin/action.cgi?cmd=ir_cut_off'
const irLedOnPath = '/cgi-bin/action.cgi?cmd=ir_led_on'
const irLedOffPath = '/cgi-bin/action.cgi?cmd=ir_led_off'
const prefix = 'http://' + window.location.hostname
const checkInterval = 10000 // every 10 seconds

if (window.timerId != null) {
  clearInterval(window.timerId)
}
window.timerId = setInterval(checkAndAdjust, checkInterval);

function checkAndAdjust(){
  var img = document.getElementById("liveview");
  if (img == null) return
  if (img.complete) {
    checkAndAdjustImage(img)
  } else {
    img.onload = () => checkAndAdjustImage(img)
  }
}

function checkAndAdjustImage(img) {
  var rgb = getAverageColourAsRGB(img)
  var brightness = (rgb.r + rgb.g + rgb.b) / 3
  if (isOn('ir_led')) {
    brightness = rgb.g
  }
  log('r: ' + rgb.r + ', g: ' + rgb.g + ', b: ' + rgb.b + ', brightness: ' + brightness)

  if (isOn('auto_night_detection')) {
    httpGet(prefix + autoOffPath)
  }

  if(brightness < 60) {
    if (!isOn('ir_led')) {
      log('Turning on night mode')
      httpGet(prefix + irLedOnPath)
    } else {
      log('No state change required')
    }
    if (isOn('ir_cut')) {
      httpGet(prefix + irCutOffPath)
    }
  } else {
    if (isOn('ir_led')) {
      log('Turning off night mode')
      httpGet(prefix + irLedOffPath)
    } else {
      log('No state change required')
    }
    if (!isOn('ir_cut')) {
      httpGet(prefix + irCutOnPath)
    }
  }
}

function log(msg) {
  now = new Date()
  console.log("[" + now.toLocaleDateString() + " " + now.toLocaleTimeString() + "]", msg)
}

// feature can be one of auto_night_detection, ir_led, ir_cut
function isOn(feature) {
  var result = httpGet(prefix + "/cgi-bin/state.cgi?cmd=" + feature).trim()
  return (result != 'OFF')
}

// https://gist.github.com/olvado/1048628/d8184b8ea695372e49b403555870a044ec9d25d0
function getAverageColourAsRGB (img) {
  console.log(img)
  var canvas = document.createElement('canvas'),
    context = canvas.getContext && canvas.getContext('2d'),
    rgb = {r:0,g:0,b:0}, // Set a base colour as a fallback for non-compliant browsers
    pixelInterval = 5, // Rather than inspect every single pixel in the image inspect every 5th pixel
    count = 0,
    i = -4,
    data, length;

  // return the base colour for non-compliant browsers
  if (!context) { alert('Your browser does not support CANVAS'); return rgb; }

  // set the height and width of the canvas element to that of the image
  var height = canvas.height = img.naturalHeight || img.offsetHeight || img.height,
    width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

  context.drawImage(img, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch(e) {
    // catch errors - usually due to cross domain security issues
    alert(e);
    return rgb;
  }

  data = data.data;
  length = data.length;
  while ((i += pixelInterval * 4) < length) {
    count++;
    rgb.r += data[i];
    rgb.g += data[i+1];
    rgb.b += data[i+2];
  }

  // floor the average values to give correct rgb values (ie: round number values)
  rgb.r = Math.floor(rgb.r/count);
  rgb.g = Math.floor(rgb.g/count);
  rgb.b = Math.floor(rgb.b/count);

  return rgb;
}

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}
