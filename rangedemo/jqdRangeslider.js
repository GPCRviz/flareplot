/**
 * Created by rfonseca on 4/27/17.
 */

/*jslint browser:true */
/*jslint this */



function createJQDRangeslider (rangeMin, rangeMax, containerSelector) {
    "use strict";

    var sliderRange = {begin: rangeMin, end: rangeMin};

    $(function () {

        var $drg = $(document.createElement("div"));
        $drg.attr("class", "drag");
        $drg.append( $(document.createElement("div")).attr("class", "handle WW") );
        $drg.append( $(document.createElement("div")).attr("class", "handle EE") );

        var $con = $(containerSelector);
        $con.append($drg);

        var con_width = parseFloat($con.css("width"));

        $(".drag")
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
                    props.width = Math.min(Math.max(10, dd.width + dd.deltaX), $con.innerWidth() - dd.originalX + $con.offset().left);
                }
                if (dd.attr.indexOf("WW") > -1) {
                    props.width = Math.max(10, dd.width - dd.deltaX);
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

    function setRange (b, e) {
        sliderRange.begin = b;
        sliderRange.end = e;
    }

    function updateUIFromRange () {

    }

    function updateRangeFromUI () {

    }

    /**
     * Returns or sets the range depending on arguments.
     * If `b` and `e` are both numbers then the range is set to span from `b` to `e`.
     * If `b` is a number and `e` is undefined the beginning of the slider is moved to `r`.
     * If both `b` and `e` are undefined the currently set range is returned as an object with `begin` and `end`
     * attributes.
     * @param b
     * @param e
     */
    function range(b, e) {
        if (typeof b === "number" && typeof e === "number") {

            setRange(Math.min(b, e, rangeMax), Math.max(b, e, rangeMin));

        } else if (typeof b === "number") {

            var dif = sliderRange.end - sliderRange.begin;
            var beg = Math.min(b, rangeMax - dif);
            var end = beg + dif;
            setRange(beg, end);

        }

        return {begin: sliderRange.begin, end: sliderRange.end};
    }

    return {
        range: range,
        onChange: onChange
    };
}
