/**
 * Created by rfonseca on 4/27/17.
 */

/*jslint browser:true */
/*jslint this */


/**
 *
 * @param rangeMin
 * @param rangeMax
 * @param containerSelector
 * @returns {{range: range, onChange: onChange}}
 */
function createJQDRangeslider (rangeMin, rangeMax, containerSelector) {
    "use strict";

    var sliderRange = {begin: rangeMin, end: rangeMin};
    var $container;
    var $drag;
    var minWidth = 10;

    $(function () {

        var $drg = $(document.createElement("div"));
        $drg.attr("class", "drag");
        $drg.append( $(document.createElement("div")).attr("class", "handle WW") );
        $drg.append( $(document.createElement("div")).attr("class", "handle EE") );

        var $con = $(containerSelector);
        $container = $con;
        $con.append($drg);

        var con_width = parseFloat($con.css("width"));

        $drag = $(".drag")
            .drag("start", function (ev, dd) {
                dd.attr = $(ev.target).prop("className");
                dd.width = $(this).width();
                dd.height = $(this).height();

                dd.limit = $con.offset();
                dd.limit.right = $con.outerWidth() - $(this).outerWidth();

            })
            .drag(function (ev, dd) {

                var props = {};
                if (dd.attr.indexOf("EE") > -1) {
                    props.width = Math.min(Math.max(minWidth, dd.width + dd.deltaX), $con.innerWidth() - dd.originalX + $con.offset().left);
                }
                if (dd.attr.indexOf("WW") > -1) {
                    props.width = Math.max(minWidth, dd.width - dd.deltaX);
                    props.left = dd.originalX + dd.width - props.width - $con.offset().left;
                    if (props.left < 0) {
                        props.width += props.left;
                        props.left = 0;
                    }
                }
                if (dd.attr.indexOf("drag") > -1) {
                    props.left = Math.min(dd.limit.right, Math.max(dd.offsetX - $con.offset().left, 0));
                }
                $(this).css(props);
            });

        //Reposition slider on window resize
        $(window).resize(function (ev) {
            var new_width = parseFloat($con.css("width"));
            var ratio = new_width / con_width;
            con_width = new_width;

            var props = {};
            props.left = parseFloat($(".drag").css("left")) * ratio;

            var dragWidth = parseFloat($(".drag").css("width"));
            if (dragWidth > 10.5) {
                props.width = Math.max(dragWidth * ratio, 10);
            }

            $(".drag").css(props);
        });

        //Click on bar
        $con.mousedown(function (ev) {
            var x = ev.offsetX;
            var props = {};
            var dragWidth = parseFloat($(".drag").css("width"));
            var conWidth = parseFloat($con.css("width"));
            props.left = Math.min(conWidth - dragWidth, Math.max(x - dragWidth / 2, 0));
            $(".drag").css(props);
        });

    });

    var changeListeners = [];

    function onChange(callback){
        changeListeners.push(callback);
        return this;
    }

    function updateUIFromRange () {
        var conW = parseFloat($container.css("width"));
        var rangeW = sliderRange.end - sliderRange.begin;
        var slope = (conW - minWidth) / (rangeMax - rangeMin);
        var uirangeW = minWidth + rangeW * slope;
        var ratio = sliderRange.begin / (rangeMax - rangeMin - rangeW);
        if (isNaN(ratio)) {
            ratio = 0;
        }
        $drag.css("left", (ratio * (conW - uirangeW)) + "px");
        $drag.css("width", uirangeW + "px");

    }

    function updateRangeFromUI () {

    }

    function setRange (b, e) {
        sliderRange.begin = b;
        sliderRange.end = e;

        updateUIFromRange();
    }


    /**
     * Returns or sets the range depending on arguments.
     * If `b` and `e` are both numbers then the range is set to span from `b` to `e`.
     * If `b` is a number and `e` is undefined the beginning of the slider is moved to `b`.
     * If both `b` and `e` are undefined the currently set range is returned as an object with `begin` and `end`
     * attributes.
     * If any arguments cause the range to be outside of the `rangeMin` and `rangeMax` specified on slider creation
     * then a warning is printed and the range correspondingly clamped.
     * @param b beginning of range
     * @param e end of range
     * @returns {{begin: number, end: number}}
     */
    function range(b, e) {
        var rLower;
        var rUpper;

        if (typeof b === "number" && typeof e === "number") {

            rLower = Math.min(b, e);
            rUpper = Math.max(b, e);

            //Check that lower and upper range are within their bounds
            if (rLower < rangeMin || rUpper > rangeMax) {
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds" +
                    " (" + rangeMin + "," + rangeMax + "). ");
                rLower = Math.max(rLower, rangeMin);
                rUpper = Math.min(rUpper, rangeMax);
            }

            //Set the range
            setRange(rLower, rUpper);
        } else if (typeof b === "number") {

            rLower = b;
            var dif = sliderRange.end - sliderRange.begin;
            rUpper = rLower + dif;

            if (rLower < rangeMin) {
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds" +
                    " (" + rangeMin + "," + rangeMax + "). ");
                rLower = rangeMin;
            }
            if(rUpper > rangeMax){
                console.log("Warning: trying to set range (" + rLower + "," + rUpper + ") which is outside of bounds" +
                    " (" + rangeMin + "," + rangeMax + "). ");
                rLower = rangeMax - dif;
                rUpper = rangeMax;
            }

            setRange(rLower, rUpper);
        }

        return {begin: sliderRange.begin, end: sliderRange.end};
    }

    return {
        range: range,
        onChange: onChange
    };
}
