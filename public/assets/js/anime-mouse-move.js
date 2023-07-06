//obj Image Animation
var hoverLayer = $("body");

var objImgOne = $(".fk-global-img__obj");

//Animation Init
hoverLayer.mousemove(function(e) {
    var valueX = (e.pageX * -1) / 60;
    var valueY = (e.pageY * -1) / 80;
    if(objImgOne.length) {
        objImgOne.css({
            transform: "translate3d(" + valueX + "px," + valueY + "px, 0)"
        });
    }
    
});
