
function initSlider(selection, height){
    //User variables
    var handleWidth = 5;
    var handleGap   = 2;

    //Local variables
    var prevX;

    $(selection).css({
        "height": height,
        "padding-left": (handleWidth+handleGap)+"px",
        "padding-right": (handleWidth+handleGap)+"px"
    });


    //Create handles and range
    var innerRange = document.createElement("div");
    var innerHandleL = document.createElement("div");
    var innerHandleR = document.createElement("div");

    //Append handles and range
    $(selection).append(innerRange);
    $(selection).append(innerHandleL);
    $(selection).append(innerHandleR);

    //Style handles and range
    $(innerRange).addClass("jqslider-range")
        .css({"height": height, "width": "20%"})
        .draggable({axis: "x", containment: "parent",
            start: function(e){ prevX = e.screenX; },
            drag: function(e){
                //Move handles
                var xleft  = parseFloat($(this).css("left"));
                var xright = xleft + parseFloat($(this).css("width"));
                var pleft  = xleft; //Handles are placed absolutely, so margin is subtracted
                var pright = xright+handleWidth+handleWidth;
                $(innerHandleL).css({left: pleft+"px"});
                $(innerHandleR).css({left: pright+"px"});

            }

        });

    $(innerHandleL).addClass("jqslider-handle")
        .css({"left": "-10px"})
        .draggable({axis: "x"});

    $(innerHandleR).addClass("jqslider-handle")
        .css({"right": "10px"})
        .draggable({axis: "x"});

    $(selection).mousedown(
        function(e){
            $(innerRange).css("left",e.offsetX+"px");
        });

    $(innerRange).mousedown(function(e){ e.stopPropagation(); });
    $(innerHandleR).mousedown(function(e){ e.stopPropagation(); });
    $(innerHandleL).mousedown(function(e){ e.stopPropagation(); });

}

