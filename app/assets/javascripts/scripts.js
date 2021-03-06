

var logoCurrentPosition = 0;
var counter = 0
$( document ).ready( function() {
  var windowWidth = $(window).width();
  var windowHeight = 882;
  console.log("windowHeight: " + windowHeight)
  var horizontalCircles = Math.ceil(windowWidth / 240);
  var verticalCircles = Math.ceil(windowHeight / 240);

  console.log("verticalCircles: " + verticalCircles)
  var backgroundWidth = horizontalCircles * 240;
  var backgroundHeight = verticalCircles * 240;
  console.log("backgroundHeight: " + backgroundHeight)
  var xOffset = ((backgroundWidth - windowWidth)/2)*(-1)
  var yOffset = ((backgroundHeight - windowHeight)/2)*(-1)
  if (windowWidth > 399) {
    $(".background").css("width", backgroundWidth);
    $(".background").css("height", backgroundHeight);
    $(".background").css("left", xOffset);
    $(".background").css("top", yOffset);
  }
  createGrid(horizontalCircles,verticalCircles);
});

function createGrid(w,h) {
  for (i = 0; i < w; i++) {
    var xPos = i * 240;
    for (g = 0; g < h; g++) {
      var yPos = g * 240;
      createCircle(xPos, yPos);
    }
  }
}

function createCircle(x,y) {
  var topLeft = $('<div class="cell top-left"></div>');
  topLeft.css('top', y + "px");
  topLeft.css('left', x + "px");
  topLeft.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var topMiddle = $('<div class="cell top-middle"></div>');  // Create element with HTML
  topMiddle.css('top', y + "px");
  topMiddle.css('left', x + 80 + "px");
  topMiddle.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var topRight = $('<div class="cell top-right"></div>');  // Create element with HTML
  topRight.css('top', y + "px");
  topRight.css('left', x + 160 + "px");
  topRight.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var middleLeft = $('<div class="cell middle-left"></div>');  // Create element with HTML
  middleLeft.css('top', y + 80 + "px");
  middleLeft.css('left', x + "px");
  middleLeft.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var middleMiddle = $('<div class="cell middle-middle"></div>');  // Create element with HTML
  middleMiddle.css('top', y + 80 + "px");
  middleMiddle.css('left', x + 80 + "px");
  middleMiddle.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var middleRight = $('<div class="cell middle-right"></div>');  // Create element with HTML
  middleRight.css('top', y + 80 + "px");
  middleRight.css('left', x + 160 + "px");
  middleRight.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var bottomLeft = $('<div class="cell bottom-left"></div>');  // Create element with HTML
  bottomLeft.css('top', y + 160 + "px");
  bottomLeft.css('left', x + "px");
  bottomLeft.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var bottomMiddle = $('<div class="cell bottom-middle"></div>');  // Create element with HTML
  bottomMiddle.css('top', y + 160 + "px");
  bottomMiddle.css('left', x + 80 + "px");
  bottomMiddle.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  var bottomRight = $('<div class="cell bottom-right"></div>');  // Create element with HTML
  bottomRight.css('top', y + 160 + "px");
  bottomRight.css('left', x + 160 + "px");
  bottomRight.css('backgroundPosition', Math.floor(Math.random() * 6)* 80);
  $(".background").append(topLeft, topMiddle, topRight, middleLeft, middleMiddle, middleRight, bottomLeft, bottomMiddle, bottomRight);      // Append the new elements
}

$('body').on('mousemove', 'div.cell', function() {
  counter++;
  if (counter >= 11) {
    logoCurrentPosition +=80;
    setPosition($(this),logoCurrentPosition)
    counter = 0;
  }
});

function setPosition(element,num){
  element.css({
      backgroundPosition: num
  });
}
