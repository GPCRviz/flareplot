//From http://stackoverflow.com/a/9538602/2056031
function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}

function initSlider(divId){
  var sl = {
    backStyle: "background:white; border: solid 1px #BBB",
    rangeStyle: "background: #E9E9E9; border: solid 1px #BBB; cursor: ew-resize;",
    buttonStyle: "background: #F6F6F6; border: solid 1px #C5C5C5; border-radius: 0.2em",

    height: "1em",
    buttonSz: 7,
    buttonOffset: 4,

    rangeStart: 10,
    rangeEnd: 30,
    rangeDomainStart: 0,
    rangeDomainEnd: 100,

    update: function(){
      sl.topDiv.style.padding = "0px";
      sl.topDiv.style.height = sl.height;

      sl.back.style = sl.backStyle;
      sl.range.style = sl.rangeStyle;
      sl.button1.style = sl.buttonStyle;
      sl.button2.style = sl.buttonStyle;

      var height = sl.topDiv.clientHeight; // sl.height might have units ; this is px.
      var rangeExtentStart = sl.buttonOffset+sl.buttonSz;
      var rangeExtentEnd   = sl.topDiv.offsetWidth - sl.buttonOffset - sl.buttonSz;
      var rangeExtentWidth = rangeExtentEnd - rangeExtentStart;
      var rangeStartPos = (rangeExtentStart + rangeExtentWidth*(sl.rangeStart-sl.rangeDomainStart)/(sl.rangeDomainEnd-sl.rangeDomainStart));
      var rangeEndPos = (rangeExtentStart + rangeExtentWidth*(sl.rangeEnd-sl.rangeDomainStart)/(sl.rangeDomainEnd-sl.rangeDomainStart));

      sl.back.style.position = "absolute";
      sl.back.style.top = "0px";
      sl.back.style.left = rangeExtentStart+"px";
      sl.back.style.width = (rangeExtentEnd-rangeExtentStart)+"px";
      sl.back.style.height = height+"px";

      sl.range.style.position = "absolute";
      sl.range.style.top = "3px";
      sl.range.style.left = rangeStartPos + "px";
      sl.range.style.width = (rangeEndPos-rangeStartPos)+"px";
      try {
        var borderWidth = parseFloat(getComputedStyle(sl.range, '').getPropertyValue('border-width'));
        sl.range.style.height = (height-2*borderWidth-5)+"px";
      }catch(e){
        sl.range.style.height = (height-2)+"px";
      }

      sl.button1.style.position = "absolute";
      sl.button1.style.width  = sl.buttonSz+"px";
      sl.button1.style.height = sl.buttonSz+"px";
      sl.button1.style.top = ((height-sl.buttonSz)/2)+"px";
      sl.button1.style.left = (rangeStartPos - sl.buttonSz - sl.buttonOffset)+"px";
      sl.button1.style.cursor = "w-resize";

      sl.button2.style.position = "absolute";
      sl.button2.style.width  = sl.buttonSz+"px";
      sl.button2.style.height = sl.buttonSz+"px";
      sl.button2.style.top = ((height-sl.buttonSz)/2)+"px";
      sl.button2.style.left = (rangeEndPos+sl.buttonOffset)+"px";
      sl.button2.style.cursor = "e-resize";

      if( isFunction(sl.onchange) ){
        sl.onchange();
      }
    }

  };

  sl.topDiv = document.getElementById(divId);
  sl.topDiv.style.position = "relative";

  sl.back = document.createElement("div");
  sl.topDiv.appendChild(sl.back);
  sl.back.onclick = function(e){
    var backRatio = e.offsetX / sl.back.offsetWidth;
    var rangeWidth = sl.rangeEnd - sl.rangeStart;
    sl.rangeStart = backRatio*(sl.rangeDomainEnd-sl.rangeDomainStart);
    sl.rangeEnd = Math.min(sl.rangeDomainEnd, sl.rangeStart+rangeWidth);
    sl.update();
  }

  sl.range = document.createElement("div");
  sl.topDiv.appendChild(sl.range);
  sl.range.onmousedown = function(e){
    lastEvent = e;
    window.onmouseup = function(){
      window.onmouseup = undefined;
      window.onmousemove = undefined;
    }
    window.onmousemove = function(e){
      var deltaX = e.screenX - lastEvent.screenX;
      lastEvent = e;

      var deltaRatio = deltaX / sl.back.offsetWidth;
      var deltaRange = deltaRatio*(sl.rangeDomainEnd-sl.rangeDomainStart)
      if( deltaRange>sl.rangeDomainEnd-sl.rangeEnd) deltaRange = sl.rangeDomainEnd-sl.rangeEnd;
      if( deltaRange<sl.rangeDomainStart-sl.rangeStart) deltaRange = sl.rangeDomainStart-sl.rangeStart;
      sl.rangeStart += deltaRange;
      sl.rangeEnd   += deltaRange;
      sl.update();
    }
  }

  sl.button1 = document.createElement("div");
  sl.topDiv.appendChild(sl.button1);
  sl.button1.onmousedown = function(e){
    lastEvent = e;
    window.onmouseup = function(){
      window.onmouseup = undefined;
      window.onmousemove = undefined;
    }
    window.onmousemove = function(e){
      var deltaX = e.screenX - lastEvent.screenX;
      lastEvent = e;

      var deltaRatio = deltaX / sl.back.offsetWidth;
      var deltaRange = deltaRatio*(sl.rangeDomainEnd-sl.rangeDomainStart)
      sl.rangeStart = Math.max( sl.rangeDomainStart, Math.min(sl.rangeDomainEnd, sl.rangeStart+deltaRange ) );
      sl.rangeEnd = Math.max(sl.rangeEnd, sl.rangeStart);
      sl.update();
    }
  }

  sl.button2 = document.createElement("div");
  sl.button2.onmousedown = function(e){
    lastEvent = e;
    window.onmouseup = function(){
      window.onmouseup = undefined;
      window.onmousemove = undefined;
    }
    window.onmousemove = function(e){
      var deltaX = e.screenX - lastEvent.screenX;
      lastEvent = e;

      var deltaRatio = deltaX / sl.back.offsetWidth;
      var deltaRange = deltaRatio*(sl.rangeDomainEnd-sl.rangeDomainStart)
      sl.rangeEnd = Math.max( sl.rangeDomainStart, Math.min(sl.rangeDomainEnd, sl.rangeEnd+deltaRange ) );
      sl.rangeStart = Math.min(sl.rangeEnd, sl.rangeStart);
      sl.update();
    }
  }
  sl.topDiv.appendChild(sl.button2);


  sl.update();

  return sl;
}
