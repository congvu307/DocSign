/** @preserve 
jSignature v2 "${buildDate}" "${commitID}"
Copyright (c) 2012 Willow Systems Corp http://willow-systems.com
Copyright (c) 2010 Brinley Ang http://www.unbolt.net
MIT License <https://www.opensource.org/licenses/mit-license.php> 
*/
(function () {

    var apinamespace = 'jSignature'

    /**
    Allows one to delay certain eventual action by setting up a timer for it and allowing one to delay it
    by "kick"ing it. Sorta like "kick the can down the road"
    @public
    @class
    @param
    @returns {Type}
    */
    var KickTimerClass = function (time, callback) {
        var timer
        this.kick = function () {
            clearTimeout(timer)
            timer = setTimeout(
                callback
                , time
            )
        }
        this.clear = function () {
            clearTimeout(timer)
        }
        return this
    }

    var PubSubClass = function (context) {
        'use strict'
        /*  @preserve 
        -----------------------------------------------------------------------------------------------
        JavaScript PubSub library
        2012 (c) Willow Systems Corp (www.willow-systems.com)
        based on Peter Higgins (dante@dojotoolkit.org)
        Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
        Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
        http://dojofoundation.org/license for more information.
        -----------------------------------------------------------------------------------------------
        */
        this.topics = {}
        // here we choose what will be "this" for the called events.
        // if context is defined, it's context. Else, 'this' is this instance of PubSub
        this.context = context ? context : this
        /**
         * Allows caller to emit an event and pass arguments to event listeners.
         * @public
         * @function
         * @param topic {String} Name of the channel on which to voice this event
         * @param **arguments Any number of arguments you want to pass to the listeners of this event.
         */
        this.publish = function (topic, arg1, arg2, etc) {
            'use strict'
            if (this.topics[topic]) {
                var currentTopic = this.topics[topic]
                    , args = Array.prototype.slice.call(arguments, 1)
                    , toremove = []
                    , fn
                    , i, l
                    , pair

                for (i = 0, l = currentTopic.length; i < l; i++) {
                    pair = currentTopic[i] // this is a [function, once_flag] array
                    fn = pair[0]
                    if (pair[1] /* 'run once' flag set */) {
                        pair[0] = function () { }
                        toremove.push(i)
                    }
                    fn.apply(this.context, args)
                }
                for (i = 0, l = toremove.length; i < l; i++) {
                    currentTopic.splice(toremove[i], 1)
                }
            }
        }
        /**
         * Allows listener code to subscribe to channel and be called when data is available 
         * @public
         * @function
         * @param topic {String} Name of the channel on which to voice this event
         * @param callback {Function} Executable (function pointer) that will be ran when event is voiced on this channel.
         * @param once {Boolean} (optional. False by default) Flag indicating if the function is to be triggered only once.
         * @returns {Object} A token object that cen be used for unsubscribing.  
         */
        this.subscribe = function (topic, callback, once) {
            'use strict'
            if (!this.topics[topic]) {
                this.topics[topic] = [[callback, once]];
            } else {
                this.topics[topic].push([callback, once]);
            }
            return {
                "topic": topic,
                "callback": callback
            };
        };
        /**
         * Allows listener code to unsubscribe from a channel 
         * @public
         * @function
         * @param token {Object} A token object that was returned by `subscribe` method 
         */
        this.unsubscribe = function (token) {
            if (this.topics[token.topic]) {
                var currentTopic = this.topics[token.topic]

                for (var i = 0, l = currentTopic.length; i < l; i++) {
                    if (currentTopic[i][0] === token.callback) {
                        currentTopic.splice(i, 1)
                    }
                }
            }
        }
    }

    /// Returns front, back and "decor" colors derived from element (as jQuery obj)
    function getColors($e) {
        var tmp
            , undef
            , frontcolor = $e.css('color')
            , backcolor
            , e = $e[0]

        var toOfDOM = false
        while (e && !backcolor && !toOfDOM) {
            try {
                tmp = $(e).css('background-color')
            } catch (ex) {
                tmp = 'transparent'
            }
            if (tmp !== 'transparent' && tmp !== 'rgba(0, 0, 0, 0)') {
                backcolor = tmp
            }
            toOfDOM = e.body
            e = e.parentNode
        }

        var rgbaregex = /rgb[a]*\((\d+),\s*(\d+),\s*(\d+)/ // modern browsers
            , hexregex = /#([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})/ // IE 8 and less.
            , frontcolorcomponents

        // Decomposing Front color into R, G, B ints
        tmp = undef
        tmp = frontcolor.match(rgbaregex)
        if (tmp) {
            frontcolorcomponents = { 'r': parseInt(tmp[1], 10), 'g': parseInt(tmp[2], 10), 'b': parseInt(tmp[3], 10) }
        } else {
            tmp = frontcolor.match(hexregex)
            if (tmp) {
                frontcolorcomponents = { 'r': parseInt(tmp[1], 16), 'g': parseInt(tmp[2], 16), 'b': parseInt(tmp[3], 16) }
            }
        }
        //		if(!frontcolorcomponents){
        //			frontcolorcomponents = {'r':255,'g':255,'b':255}
        //		}

        var backcolorcomponents
        // Decomposing back color into R, G, B ints
        if (!backcolor) {
            // HIghly unlikely since this means that no background styling was applied to any element from here to top of dom.
            // we'll pick up back color from front color
            if (frontcolorcomponents) {
                if (Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b]) > 127) {
                    backcolorcomponents = { 'r': 0, 'g': 0, 'b': 0 }
                } else {
                    backcolorcomponents = { 'r': 255, 'g': 255, 'b': 255 }
                }
            } else {
                // arg!!! front color is in format we don't understand (hsl, named colors)
                // Let's just go with white background.
                backcolorcomponents = { 'r': 255, 'g': 255, 'b': 255 }
            }
        } else {
            tmp = undef
            tmp = backcolor.match(rgbaregex)
            if (tmp) {
                backcolorcomponents = { 'r': parseInt(tmp[1], 10), 'g': parseInt(tmp[2], 10), 'b': parseInt(tmp[3], 10) }
            } else {
                tmp = backcolor.match(hexregex)
                if (tmp) {
                    backcolorcomponents = { 'r': parseInt(tmp[1], 16), 'g': parseInt(tmp[2], 16), 'b': parseInt(tmp[3], 16) }
                }
            }
            //			if(!backcolorcomponents){
            //				backcolorcomponents = {'r':0,'g':0,'b':0}
            //			}
        }

        // Deriving Decor color
        // THis is LAZY!!!! Better way would be to use HSL and adjust luminocity. However, that could be an overkill. 

        var toRGBfn = function (o) { return 'rgb(' + [o.r, o.g, o.b].join(', ') + ')' }
            , decorcolorcomponents
            , frontcolorbrightness
            , adjusted

        if (frontcolorcomponents && backcolorcomponents) {
            var backcolorbrightness = Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b])

            frontcolorbrightness = Math.max.apply(null, [backcolorcomponents.r, backcolorcomponents.g, backcolorcomponents.b])
            adjusted = Math.round(frontcolorbrightness + (-1 * (frontcolorbrightness - backcolorbrightness) * 0.75)) // "dimming" the difference between pen and back.
            decorcolorcomponents = { 'r': adjusted, 'g': adjusted, 'b': adjusted } // always shade of gray
        } else if (frontcolorcomponents) {
            frontcolorbrightness = Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b])
            var polarity = +1
            if (frontcolorbrightness > 127) {
                polarity = -1
            }
            // shifting by 25% (64 points on RGB scale)
            adjusted = Math.round(frontcolorbrightness + (polarity * 96)) // "dimming" the pen's color by 75% to get decor color.
            decorcolorcomponents = { 'r': adjusted, 'g': adjusted, 'b': adjusted } // always shade of gray
        } else {
            decorcolorcomponents = { 'r': 191, 'g': 191, 'b': 191 } // always shade of gray
        }

        return {
            'color': frontcolor
            , 'background-color': backcolorcomponents ? toRGBfn(backcolorcomponents) : backcolor
            , 'decor-color': toRGBfn(decorcolorcomponents)
        }
    }

    function Vector(x, y) {
        this.x = x
        this.y = y
        this.reverse = function () {
            return new this.constructor(
                this.x * -1
                , this.y * -1
            )
        }
        this._length = null
        this.getLength = function () {
            if (!this._length) {
                this._length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
            }
            return this._length
        }

        var polarity = function (e) {
            return Math.round(e / Math.abs(e))
        }
        this.resizeTo = function (length) {
            // proportionally changes x,y such that the hypotenuse (vector length) is = new length
            if (this.x === 0 && this.y === 0) {
                this._length = 0
            } else if (this.x === 0) {
                this._length = length
                this.y = length * polarity(this.y)
            } else if (this.y === 0) {
                this._length = length
                this.x = length * polarity(this.x)
            } else {
                var proportion = Math.abs(this.y / this.x)
                    , x = Math.sqrt(Math.pow(length, 2) / (1 + Math.pow(proportion, 2)))
                    , y = proportion * x
                this._length = length
                this.x = x * polarity(this.x)
                this.y = y * polarity(this.y)
            }
            return this
        }

        /**
         * Calculates the angle between 'this' vector and another.
         * @public
         * @function
         * @returns {Number} The angle between the two vectors as measured in PI. 
         */
        this.angleTo = function (vectorB) {
            var divisor = this.getLength() * vectorB.getLength()
            if (divisor === 0) {
                return 0
            } else {
                // JavaScript floating point math is screwed up.
                // because of it, the core of the formula can, on occasion, have values
                // over 1.0 and below -1.0.
                return Math.acos(
                    Math.min(
                        Math.max(
                            (this.x * vectorB.x + this.y * vectorB.y) / divisor
                            , -1.0
                        )
                        , 1.0
                    )
                ) / Math.PI
            }
        }
    }

    function Point(x, y) {
        this.x = x
        this.y = y

        this.getVectorToCoordinates = function (x, y) {
            return new Vector(x - this.x, y - this.y)
        }
        this.getVectorFromCoordinates = function (x, y) {
            return this.getVectorToCoordinates(x, y).reverse()
        }
        this.getVectorToPoint = function (point) {
            return new Vector(point.x - this.x, point.y - this.y)
        }
        this.getVectorFromPoint = function (point) {
            return this.getVectorToPoint(point).reverse()
        }
    }

    /*
     * About data structure:
     * We don't store / deal with "pictures" this signature capture code captures "vectors"
     * 
     * We don't store bitmaps. We store "strokes" as arrays of arrays. (Actually, arrays of objects containing arrays of coordinates.
     * 
     * Stroke = mousedown + mousemoved * n (+ mouseup but we don't record that as that was the "end / lack of movement" indicator)
     * 
     * Vectors = not classical vectors where numbers indicated shift relative last position. Our vectors are actually coordinates against top left of canvas.
     * 			we could calc the classical vectors, but keeping the the actual coordinates allows us (through Math.max / min) 
     * 			to calc the size of resulting drawing very quickly. If we want classical vectors later, we can always get them in backend code.
     * 
     * So, the data structure:
     * 
     * var data = [
     * 	{ // stroke starts
     * 		x : [101, 98, 57, 43] // x points
     * 		, y : [1, 23, 65, 87] // y points
     * 	} // stroke ends
     * 	, { // stroke starts
     * 		x : [55, 56, 57, 58] // x points
     * 		, y : [101, 97, 54, 4] // y points
     * 	} // stroke ends
     * 	, { // stroke consisting of just a dot
     * 		x : [53] // x points
     * 		, y : [151] // y points
     * 	} // stroke ends
     * ]
     * 
     * we don't care or store stroke width (it's canvas-size-relative), color, shadow values. These can be added / changed on whim post-capture.
     * 
     */
    function DataEngine(storageObject, context, startStrokeFn, addToStrokeFn, endStrokeFn) {
        this.data = storageObject // we expect this to be an instance of Array
        this.context = context

        if (storageObject.length) {
            // we have data to render
            var numofstrokes = storageObject.length
                , stroke
                , numofpoints

            for (var i = 0; i < numofstrokes; i++) {
                stroke = storageObject[i]
                numofpoints = stroke.x.length
                startStrokeFn.call(context, stroke)
                for (var j = 1; j < numofpoints; j++) {
                    addToStrokeFn.call(context, stroke, j)
                }
                endStrokeFn.call(context, stroke)
            }
        }

        this.changed = function () { }

        this.startStrokeFn = startStrokeFn
        this.addToStrokeFn = addToStrokeFn
        this.endStrokeFn = endStrokeFn

        this.inStroke = false

        this._lastPoint = null
        this._stroke = null
        this.startStroke = function (point) {
            if (point && typeof (point.x) == "number" && typeof (point.y) == "number") {
                this._stroke = { 'x': [point.x], 'y': [point.y] }
                this.data.push(this._stroke)
                this._lastPoint = point
                this.inStroke = true
                // 'this' does not work same inside setTimeout(
                var stroke = this._stroke
                    , fn = this.startStrokeFn
                    , context = this.context
                setTimeout(
                    // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                    function () { fn.call(context, stroke) }
                    , 3
                )
                return point
            } else {
                return null
            }
        }
        // that "5" at the very end of this if is important to explain.
        // we do NOT render links between two captured points (in the middle of the stroke) if the distance is shorter than that number.
        // not only do we NOT render it, we also do NOT capture (add) these intermediate points to storage.
        // when clustering of these is too tight, it produces noise on the line, which, because of smoothing, makes lines too curvy.
        // maybe, later, we can expose this as a configurable setting of some sort.
        this.addToStroke = function (point) {
            if (this.inStroke &&
                typeof (point.x) === "number" &&
                typeof (point.y) === "number" &&
                // calculates absolute shift in diagonal pixels away from original point
                (Math.abs(point.x - this._lastPoint.x) + Math.abs(point.y - this._lastPoint.y)) > 4
            ) {
                var positionInStroke = this._stroke.x.length
                this._stroke.x.push(point.x)
                this._stroke.y.push(point.y)
                this._lastPoint = point

                var stroke = this._stroke
                    , fn = this.addToStrokeFn
                    , context = this.context
                setTimeout(
                    // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                    function () { fn.call(context, stroke, positionInStroke) }
                    , 3
                )
                return point
            } else {
                return null
            }
        }
        this.endStroke = function () {
            var c = this.inStroke
            this.inStroke = false
            this._lastPoint = null
            if (c) {
                var stroke = this._stroke
                    , fn = this.endStrokeFn // 'this' does not work same inside setTimeout(
                    , context = this.context
                    , changedfn = this.changed
                setTimeout(
                    // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                    function () {
                        fn.call(context, stroke)
                        changedfn.call(context)
                    }
                    , 3
                )
                return true
            } else {
                return null
            }
        }
    }

    var basicDot = function (ctx, x, y, size) {
        var fillStyle = ctx.fillStyle
        ctx.fillStyle = ctx.strokeStyle
        ctx.fillRect(x + size / -2, y + size / -2, size, size)
        ctx.fillStyle = fillStyle
    }
        , basicLine = function (ctx, startx, starty, endx, endy) {
            ctx.beginPath()
            ctx.moveTo(startx, starty)
            ctx.lineTo(endx, endy)
            ctx.stroke()
        }
        , basicCurve = function (ctx, startx, starty, endx, endy, cp1x, cp1y, cp2x, cp2y) {
            ctx.beginPath()
            ctx.moveTo(startx, starty)
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endx, endy)
            ctx.stroke()
        }
        , strokeStartCallback = function (stroke) {
            // this = jSignatureClass instance
            basicDot(this.canvasContext, stroke.x[0], stroke.y[0], this.settings.lineWidth)
        }
        , strokeAddCallback = function (stroke, positionInStroke) {
            // this = jSignatureClass instance

            // Because we are funky this way, here we draw TWO curves.
            // 1. POSSIBLY "this line" - spanning from point right before us, to this latest point.
            // 2. POSSIBLY "prior curve" - spanning from "latest point" to the one before it.

            // Why you ask?
            // long lines (ones with many pixels between them) do not look good when they are part of a large curvy stroke.
            // You know, the jaggedy crocodile spine instead of a pretty, smooth curve. Yuck!
            // We want to approximate pretty curves in-place of those ugly lines.
            // To approximate a very nice curve we need to know the direction of line before and after.
            // Hence, on long lines we actually wait for another point beyond it to come back from
            // mousemoved before we draw this curve.

            // So for "prior curve" to be calc'ed we need 4 points 
            // 	A, B, C, D (we are on D now, A is 3 points in the past.)
            // and 3 lines:
            //  pre-line (from points A to B), 
            //  this line (from points B to C), (we call it "this" because if it was not yet, it's the only one we can draw for sure.) 
            //  post-line (from points C to D) (even through D point is 'current' we don't know how we can draw it yet)
            //
            // Well, actually, we don't need to *know* the point A, just the vector A->B
            var Cpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
                , Dpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
                , CDvector = Cpoint.getVectorToPoint(Dpoint)

            // Again, we have a chance here to draw TWO things:
            //  BC Curve (only if it's long, because if it was short, it was drawn by previous callback) and 
            //  CD Line (only if it's short)

            // So, let's start with BC curve.
            // if there is only 2 points in stroke array, we don't have "history" long enough to have point B, let alone point A.
            // Falling through to drawing line CD is proper, as that's the only line we have points for.
            if (positionInStroke > 1) {
                // we are here when there are at least 3 points in stroke array.
                var Bpoint = new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])
                    , BCvector = Bpoint.getVectorToPoint(Cpoint)
                    , ABvector
                if (BCvector.getLength() > this.lineCurveThreshold) {
                    // Yey! Pretty curves, here we come!
                    if (positionInStroke > 2) {
                        // we are here when at least 4 points in stroke array.
                        ABvector = (new Point(stroke.x[positionInStroke - 3], stroke.y[positionInStroke - 3])).getVectorToPoint(Bpoint)
                    } else {
                        ABvector = new Vector(0, 0)
                    }

                    var minlenfraction = 0.05
                        , maxlen = BCvector.getLength() * 0.35
                        , ABCangle = BCvector.angleTo(ABvector.reverse())
                        , BCDangle = CDvector.angleTo(BCvector.reverse())
                        , BCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(
                            Math.max(minlenfraction, ABCangle) * maxlen
                        )
                        , CCP2vector = (new Vector(BCvector.x + CDvector.x, BCvector.y + CDvector.y)).reverse().resizeTo(
                            Math.max(minlenfraction, BCDangle) * maxlen
                        )

                    basicCurve(
                        this.canvasContext
                        , Bpoint.x
                        , Bpoint.y
                        , Cpoint.x
                        , Cpoint.y
                        , Bpoint.x + BCP1vector.x
                        , Bpoint.y + BCP1vector.y
                        , Cpoint.x + CCP2vector.x
                        , Cpoint.y + CCP2vector.y
                    )
                }
            }
            if (CDvector.getLength() <= this.lineCurveThreshold) {
                basicLine(
                    this.canvasContext
                    , Cpoint.x
                    , Cpoint.y
                    , Dpoint.x
                    , Dpoint.y
                )
            }
        }
        , strokeEndCallback = function (stroke) {
            // this = jSignatureClass instance

            // Here we tidy up things left unfinished in last strokeAddCallback run.

            // What's POTENTIALLY left unfinished there is the curve between the last points
            // in the stroke, if the len of that line is more than lineCurveThreshold
            // If the last line was shorter than lineCurveThreshold, it was drawn there, and there
            // is nothing for us here to do.
            // We can also be called when there is only one point in the stroke (meaning, the 
            // stroke was just a dot), in which case, again, there is nothing for us to do.

            // So for "this curve" to be calc'ed we need 3 points 
            // 	A, B, C
            // and 2 lines:
            //  pre-line (from points A to B), 
            //  this line (from points B to C) 
            // Well, actually, we don't need to *know* the point A, just the vector A->B
            // so, we really need points B, C and AB vector.
            var positionInStroke = stroke.x.length - 1

            if (positionInStroke > 0) {
                // there are at least 2 points in the stroke.we are in business.
                var Cpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
                    , Bpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
                    , BCvector = Bpoint.getVectorToPoint(Cpoint)
                    , ABvector
                if (BCvector.getLength() > this.lineCurveThreshold) {
                    // yep. This one was left undrawn in prior callback. Have to draw it now.
                    if (positionInStroke > 1) {
                        // we have at least 3 elems in stroke
                        ABvector = (new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])).getVectorToPoint(Bpoint)
                        var BCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(BCvector.getLength() / 2)
                        basicCurve(
                            this.canvasContext
                            , Bpoint.x
                            , Bpoint.y
                            , Cpoint.x
                            , Cpoint.y
                            , Bpoint.x + BCP1vector.x
                            , Bpoint.y + BCP1vector.y
                            , Cpoint.x
                            , Cpoint.y
                        )
                    } else {
                        // Since there is no AB leg, there is no curve to draw. This line is still "long" but no curve.
                        basicLine(
                            this.canvasContext
                            , Bpoint.x
                            , Bpoint.y
                            , Cpoint.x
                            , Cpoint.y
                        )
                    }
                }
            }
        }


    /*
    var getDataStats = function(){
        var strokecnt = strokes.length
            , stroke
            , pointid
            , pointcnt
            , x, y
            , maxX = Number.NEGATIVE_INFINITY
            , maxY = Number.NEGATIVE_INFINITY
            , minX = Number.POSITIVE_INFINITY
            , minY = Number.POSITIVE_INFINITY
        for(strokeid = 0; strokeid < strokecnt; strokeid++){
            stroke = strokes[strokeid]
            pointcnt = stroke.length
            for(pointid = 0; pointid < pointcnt; pointid++){
                x = stroke.x[pointid]
                y = stroke.y[pointid]
                if (x > maxX){
                    maxX = x
                } else if (x < minX) {
                    minX = x
                }
                if (y > maxY){
                    maxY = y
                } else if (y < minY) {
                    minY = y
                }
            }
        }
        return {'maxX': maxX, 'minX': minX, 'maxY': maxY, 'minY': minY}
    }
    */

    function conditionallyLinkCanvasResizeToWindowResize(jSignatureInstance, settingsWidth, apinamespace, globalEvents) {
        'use strict'
        if (settingsWidth === 'ratio' || settingsWidth.split('')[settingsWidth.length - 1] === '%') {

            this.eventTokens[apinamespace + '.parentresized'] = globalEvents.subscribe(
                apinamespace + '.parentresized'
                , (function (eventTokens, $parent, originalParentWidth, sizeRatio) {
                    'use strict'

                    return function () {
                        'use strict'

                        var w = $parent.width()
                        if (w !== originalParentWidth) {

                            // UNsubscribing this particular instance of signature pad only.
                            // there is a separate `eventTokens` per each instance of signature pad 
                            for (var key in eventTokens) {
                                if (eventTokens.hasOwnProperty(key)) {
                                    globalEvents.unsubscribe(eventTokens[key])
                                    delete eventTokens[key]
                                }
                            }

                            var settings = jSignatureInstance.settings
                            jSignatureInstance.$parent.children().remove()
                            for (var key in jSignatureInstance) {
                                if (jSignatureInstance.hasOwnProperty(key)) {
                                    delete jSignatureInstance[key]
                                }
                            }

                            // scale data to new signature pad size
                            settings.data = (function (data, scale) {
                                var newData = []
                                var o, i, l, j, m, stroke
                                for (i = 0, l = data.length; i < l; i++) {
                                    stroke = data[i]

                                    o = { 'x': [], 'y': [] }

                                    for (j = 0, m = stroke.x.length; j < m; j++) {
                                        o.x.push(stroke.x[j] * scale)
                                        o.y.push(stroke.y[j] * scale)
                                    }

                                    newData.push(o)
                                }
                                return newData
                            })(
                                settings.data
                                , w * 1.0 / originalParentWidth
                            )

                            $parent[apinamespace](settings)
                        }
                    }
                })(
                    this.eventTokens
                    , this.$parent
                    , this.$parent.width()
                    , this.canvas.width * 1.0 / this.canvas.height
                )
            )
        }
    }


    function jSignatureClass(parent, options, instanceExtensions) {

        var $parent = this.$parent = $(parent)
            , eventTokens = this.eventTokens = {}
            , events = this.events = new PubSubClass(this)
            , globalEvents = $.fn[apinamespace]('globalEvents')
            , settings = {
                'width': 'ratio'
                , 'height': 'ratio'
                , 'sizeRatio': 4 // only used when height = 'ratio'
                , 'color': '#000'
                , 'background-color': '#fff'
                , 'decor-color': '#eee'
                , 'lineWidth': 0
                , 'minFatFingerCompensation': -10
                , 'showUndoButton': true
                , 'data': []
            }

        $.extend(settings, getColors($parent))
        if (options) {
            $.extend(settings, options)
        }
        this.settings = settings

        for (var extensionName in instanceExtensions) {
            if (instanceExtensions.hasOwnProperty(extensionName)) {
                instanceExtensions[extensionName].call(this, extensionName)
            }
        }

        this.events.publish(apinamespace + '.initializing')

        // these, when enabled, will hover above the sig area. Hence we append them to DOM before canvas.
        this.$controlbarUpper = (function () {
            var controlbarstyle = 'padding:0 !important;margin:0 !important;' +
                'width: 100% !important; height: 0 !important;' +
                'margin-top:-1em !important;margin-bottom:1em !important;'
            return $('<div style="' + controlbarstyle + '"></div>').appendTo($parent)
        })();

        this.isCanvasEmulator = false // will be flipped by initializer when needed.
        var canvas = this.canvas = this.initializeCanvas(settings)
            , $canvas = $(canvas)

        this.$controlbarLower = (function () {
            var controlbarstyle = 'padding:0 !important;margin:0 !important;' +
                'width: 100% !important; height: 0 !important;' +
                'margin-top:-1.5em !important;margin-bottom:1.5em !important;'
            return $('<div style="' + controlbarstyle + '"></div>').appendTo($parent)
        })();

        this.canvasContext = canvas.getContext("2d")

        // Most of our exposed API will be looking for this:
        $canvas.data(apinamespace + '.this', this)

        settings.lineWidth = (function (defaultLineWidth, canvasWidth) {
            if (!defaultLineWidth) {
                return Math.max(
                    Math.round(canvasWidth / 400) /*+1 pixel for every extra 300px of width.*/
                    , 2 /* minimum line width */
                )
            } else {
                return defaultLineWidth
            }
        })(settings.lineWidth, canvas.width);

        this.lineCurveThreshold = settings.lineWidth * 3

        // Add custom class if defined
        if (settings.cssclass && $.trim(settings.cssclass) != "") {
            $canvas.addClass(settings.cssclass)
        }

        // used for shifting the drawing point up on touch devices, so one can see the drawing above the finger.
        this.fatFingerCompensation = 0

        var movementHandlers = (function (jSignatureInstance) {

            //================================
            // mouse down, move, up handlers:

            // shifts - adjustment values in viewport pixels drived from position of canvas on the page
            var shiftX
                , shiftY
                , setStartValues = function () {
                    var tos = $(jSignatureInstance.canvas).offset()
                    shiftX = tos.left * -1
                    shiftY = tos.top * -1
                }
                , getPointFromEvent = function (e) {
                    var firstEvent = (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : e)
                    // All devices i tried report correct coordinates in pageX,Y
                    // Android Chrome 2.3.x, 3.1, 3.2., Opera Mobile,  safari iOS 4.x,
                    // Windows: Chrome, FF, IE9, Safari
                    // None of that scroll shift calc vs screenXY other sigs do is needed.
                    // ... oh, yeah, the "fatFinger.." is for tablets so that people see what they draw.
                    return new Point(
                        Math.round(firstEvent.pageX + shiftX)
                        , Math.round(firstEvent.pageY + shiftY) + jSignatureInstance.fatFingerCompensation
                    )
                }
                , timer = new KickTimerClass(
                    750
                    , function () { jSignatureInstance.dataEngine.endStroke() }
                )

            this.drawEndHandler = function (e) {
                try { e.preventDefault() } catch (ex) { }
                timer.clear()
                jSignatureInstance.dataEngine.endStroke()
            }
            this.drawStartHandler = function (e) {
                e.preventDefault()
                // for performance we cache the offsets
                // we recalc these only at the beginning the stroke			
                setStartValues()
                jSignatureInstance.dataEngine.startStroke(getPointFromEvent(e))
                timer.kick()
            }
            this.drawMoveHandler = function (e) {
                e.preventDefault()
                if (!jSignatureInstance.dataEngine.inStroke) {
                    return
                }
                jSignatureInstance.dataEngine.addToStroke(getPointFromEvent(e))
                timer.kick()
            }

            return this

        }).call({}, this)

            //
            //================================

            ; (function (drawEndHandler, drawStartHandler, drawMoveHandler) {
                var canvas = this.canvas
                    , $canvas = $(canvas)
                    , undef
                if (this.isCanvasEmulator) {
                    $canvas.bind('mousemove.' + apinamespace, drawMoveHandler)
                    $canvas.bind('mouseup.' + apinamespace, drawEndHandler)
                    $canvas.bind('mousedown.' + apinamespace, drawStartHandler)
                } else {
                    canvas.ontouchstart = function (e) {
                        canvas.onmousedown = undef
                        canvas.onmouseup = undef
                        canvas.onmousemove = undef

                        this.fatFingerCompensation = (
                            settings.minFatFingerCompensation &&
                            settings.lineWidth * -3 > settings.minFatFingerCompensation
                        ) ? settings.lineWidth * -3 : settings.minFatFingerCompensation

                        drawStartHandler(e)

                        canvas.ontouchend = drawEndHandler
                        canvas.ontouchstart = drawStartHandler
                        canvas.ontouchmove = drawMoveHandler
                    }
                    canvas.onmousedown = function (e) {
                        canvas.ontouchstart = undef
                        canvas.ontouchend = undef
                        canvas.ontouchmove = undef

                        drawStartHandler(e)

                        canvas.onmousedown = drawStartHandler
                        canvas.onmouseup = drawEndHandler
                        canvas.onmousemove = drawMoveHandler
                    }
                }
            }).call(
                this
                , movementHandlers.drawEndHandler
                , movementHandlers.drawStartHandler
                , movementHandlers.drawMoveHandler
            )

        //=========================================
        // various event handlers

        // on mouseout + mouseup canvas did not know that mouseUP fired. Continued to draw despite mouse UP.
        // it is bettr than
        // $canvas.bind('mouseout', drawEndHandler)
        // because we don't want to break the stroke where user accidentally gets ouside and wants to get back in quickly.
        eventTokens[apinamespace + '.windowmouseup'] = globalEvents.subscribe(
            apinamespace + '.windowmouseup'
            , movementHandlers.drawEndHandler
        )

        this.events.publish(apinamespace + '.attachingEventHandlers')

        // If we have proportional width, we sign up to events broadcasting "window resized" and checking if
        // parent's width changed. If so, we (1) extract settings + data from current signature pad,
        // (2) remove signature pad from parent, and (3) reinit new signature pad at new size with same settings, (rescaled) data.
        conditionallyLinkCanvasResizeToWindowResize.call(
            this
            , this
            , settings.width.toString(10)
            , apinamespace, globalEvents
        )

        // end of event handlers.
        // ===============================

        this.resetCanvas(settings.data)

        // resetCanvas renders the data on the screen and fires ONE "change" event
        // if there is data. If you have controls that rely on "change" firing
        // attach them to something that runs before this.resetCanvas, like
        // apinamespace+'.attachingEventHandlers' that fires a bit higher.
        this.events.publish(apinamespace + '.initialized')

        return this
    } // end of initBase

    //=========================================================================
    // jSignatureClass's methods and supporting fn's

    jSignatureClass.prototype.resetCanvas = function (data) {
        var canvas = this.canvas
            , settings = this.settings
            , ctx = this.canvasContext
            , isCanvasEmulator = this.isCanvasEmulator

            , cw = canvas.width
            , ch = canvas.height

        // preparing colors, drawing area

        ctx.clearRect(0, 0, cw + 30, ch + 30)

        ctx.shadowColor = ctx.fillStyle = settings['background-color']
        if (isCanvasEmulator) {
            // FLashCanvas fills with Black by default, covering up the parent div's background
            // hence we refill 
            ctx.fillRect(0, 0, cw + 30, ch + 30)
        }

        ctx.lineWidth = Math.ceil(parseInt(settings.lineWidth, 10))
        ctx.lineCap = ctx.lineJoin = "round"

        // signature line
        ctx.strokeStyle = settings['decor-color']
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        var lineoffset = Math.round(ch / 5)
        basicLine(ctx, lineoffset * 1.5, ch - lineoffset, cw - (lineoffset * 1.5), ch - lineoffset)
        ctx.strokeStyle = settings.color

        if (!isCanvasEmulator) {
            ctx.shadowColor = ctx.strokeStyle
            ctx.shadowOffsetX = ctx.lineWidth * 0.5
            ctx.shadowOffsetY = ctx.lineWidth * -0.6
            ctx.shadowBlur = 0
        }

        // setting up new dataEngine

        if (!data) { data = [] }

        var dataEngine = this.dataEngine = new DataEngine(
            data
            , this
            , strokeStartCallback
            , strokeAddCallback
            , strokeEndCallback
        )

        settings.data = data  // onwindowresize handler uses it, i think.
        $(canvas).data(apinamespace + '.data', data)
            .data(apinamespace + '.settings', settings)

        // we fire "change" event on every change in data.
        // setting this up:
        dataEngine.changed = (function (target, events, apinamespace) {
            'use strict'
            return function () {
                events.publish(apinamespace + '.change')
                target.trigger('change')
            }
        })(this.$parent, this.events, apinamespace)
        // let's trigger change on all data reloads
        dataEngine.changed()

        // import filters will be passing this back as indication of "we rendered"
        return true
    }

    function initializeCanvasEmulator(canvas) {
        if (canvas.getContext) {
            return false
        } else {
            // for cases when jSignature, FlashCanvas is inserted
            // from one window into another (child iframe)
            // 'window' and 'FlashCanvas' may be stuck behind
            // in that other parent window.
            // we need to find it
            var window = canvas.ownerDocument.parentWindow
            var FC = window.FlashCanvas ?
                canvas.ownerDocument.parentWindow.FlashCanvas :
                (
                    typeof FlashCanvas === "undefined" ?
                        undefined :
                        FlashCanvas
                )

            if (FC) {
                canvas = FC.initElement(canvas)

                var zoom = 1
                // FlashCanvas uses flash which has this annoying habit of NOT scaling with page zoom. 
                // It matches pixel-to-pixel to screen instead.
                // Since we are targeting ONLY IE 7, 8 with FlashCanvas, we will test the zoom only the IE8, IE7 way
                if (window && window.screen && window.screen.deviceXDPI && window.screen.logicalXDPI) {
                    zoom = window.screen.deviceXDPI * 1.0 / window.screen.logicalXDPI
                }
                if (zoom !== 1) {
                    try {
                        // We effectively abuse the brokenness of FlashCanvas and force the flash rendering surface to
                        // occupy larger pixel dimensions than the wrapping, scaled up DIV and Canvas elems.
                        $(canvas).children('object').get(0).resize(Math.ceil(canvas.width * zoom), Math.ceil(canvas.height * zoom))
                        // And by applying "scale" transformation we can talk "browser pixels" to FlashCanvas
                        // and have it translate the "browser pixels" to "screen pixels"
                        canvas.getContext('2d').scale(zoom, zoom)
                        // Note to self: don't reuse Canvas element. Repeated "scale" are cumulative.
                    } catch (ex) { }
                }
                return true
            } else {
                throw new Error("Canvas element does not support 2d context. jSignature cannot proceed.")
            }
        }

    }

    jSignatureClass.prototype.initializeCanvas = function (settings) {
        // ===========
        // Init + Sizing code

        var canvas = document.createElement('canvas')
            , $canvas = $(canvas)

        // We cannot work with circular dependency
        if (settings.width === settings.height && settings.height === 'ratio') {
            settings.width = '100%'
        }

        $canvas.css(
            'margin'
            , 0
        ).css(
            'padding'
            , 0
        ).css(
            'border'
            , 'none'
        ).css(
            'height'
            , settings.height === 'ratio' || !settings.height ? 1 : settings.height.toString(10)
        ).css(
            'width'
            , settings.width === 'ratio' || !settings.width ? 1 : settings.width.toString(10)
        )

        $canvas.appendTo(this.$parent)

        // we could not do this until canvas is rendered (appended to DOM)
        if (settings.height === 'ratio') {
            $canvas.css(
                'height'
                , Math.round($canvas.width() / settings.sizeRatio)
            )
        } else if (settings.width === 'ratio') {
            $canvas.css(
                'width'
                , Math.round($canvas.height() * settings.sizeRatio)
            )
        }

        $canvas.addClass(apinamespace)

        // canvas's drawing area resolution is independent from canvas's size.
        // pixels are just scaled up or down when internal resolution does not
        // match external size. So...

        canvas.width = $canvas.width()
        canvas.height = $canvas.height()

        // Special case Sizing code

        this.isCanvasEmulator = initializeCanvasEmulator(canvas)

        // End of Sizing Code
        // ===========

        // normally select preventer would be short, but
        // Canvas emulator on IE does NOT provide value for Event. Hence this convoluted line.
        canvas.onselectstart = function (e) { if (e && e.preventDefault) { e.preventDefault() }; if (e && e.stopPropagation) { e.stopPropagation() }; return false; }

        return canvas
    }


    var GlobalJSignatureObjectInitializer = function (window) {

        var globalEvents = new PubSubClass()

            // common "window resized" event listener.
            // jSignature instances will subscribe to this chanel.
            // to resize themselves when needed.
            ; (function (globalEvents, apinamespace, $, window) {
                'use strict'

                var resizetimer
                    , runner = function () {
                        globalEvents.publish(
                            apinamespace + '.parentresized'
                        )
                    }

                // jSignature knows how to resize its content when its parent is resized
                // window resize is the only way we can catch resize events though...
                $(window).bind('resize.' + apinamespace, function () {
                    if (resizetimer) {
                        clearTimeout(resizetimer)
                    }
                    resizetimer = setTimeout(
                        runner
                        , 500
                    )
                })
                    // when mouse exists canvas element and "up"s outside, we cannot catch it with
                    // callbacks attached to canvas. This catches it outside.
                    .bind('mouseup.' + apinamespace, function (e) {
                        globalEvents.publish(
                            apinamespace + '.windowmouseup'
                        )
                    })

            })(globalEvents, apinamespace, $, window)

        var jSignatureInstanceExtensions = {
            /*
            'exampleExtension':function(extensionName){
                // we are called very early in instance's life.
                // right after the settings are resolved and 
                // jSignatureInstance.events is created 
                // and right before first ("jSignature.initializing") event is called.
                // You don't really need to manupilate 
                // jSignatureInstance directly, just attach
                // a bunch of events to jSignatureInstance.events
                // (look at the source of jSignatureClass to see when these fire)
                // and your special pieces of code will attach by themselves.
                // this function runs every time a new instance is set up.
                // this means every var you create will live only for one instance
                // unless you attach it to something outside, like "window."
                // and pick it up later from there.
                // when globalEvents' events fire, 'this' is globalEvents object
                // when jSignatureInstance's events fire, 'this' is jSignatureInstance
                // Here,
                // this = is new jSignatureClass's instance.
                // The way you COULD approch setting this up is:
                // if you have multistep set up, attach event to "jSignature.initializing"
                // that attaches other events to be fired further lower the init stream.
                // Or, if you know for sure you rely on only one jSignatureInstance's event,
                // just attach to it directly
                this.events.subscribe(
                    // name of the event
                    apinamespace + '.initializing'
                    // event handlers, can pass args too, but in majority of cases,
                    // 'this' which is jSignatureClass object instance pointer is enough to get by.
                    , function(){
                        if (this.settings.hasOwnProperty('non-existent setting category?')) {
                            console.log(extensionName + ' is here')
                        }
                    }
                )
            }
            */
        }

        var exportplugins = {
            'default': function (data) { return this.toDataURL() }
            , 'native': function (data) { return data }
            , 'image': function (data) {
                /*this = canvas elem */
                var imagestring = this.toDataURL()

                if (typeof imagestring === 'string' &&
                    imagestring.length > 4 &&
                    imagestring.slice(0, 5) === 'data:' &&
                    imagestring.indexOf(',') !== -1) {

                    var splitterpos = imagestring.indexOf(',')

                    return [
                        imagestring.slice(5, splitterpos)
                        , imagestring.substr(splitterpos + 1)
                    ]
                }
                return []
            }
        }

        // will be part of "importplugins"
        function _renderImageOnCanvas(data, formattype, rerendercallable) {
            'use strict'
            // #1. Do NOT rely on this. No worky on IE 
            //   (url max len + lack of base64 decoder + possibly other issues)
            // #2. This does NOT affect what is captured as "signature" as far as vector data is 
            // concerned. This is treated same as "signature line" - i.e. completely ignored
            // the only time you see imported image data exported is if you export as image.

            // we do NOT call rerendercallable here (unlike in other import plugins)
            // because importing image does absolutely nothing to the underlying vector data storage
            // This could be a way to "import" old signatures stored as images
            // This could also be a way to import extra decor into signature area.

            var img = new Image()
                // this = Canvas DOM elem. Not jQuery object. Not Canvas's parent div.
                , c = this

            img.onload = function () {
                var ctx = c.getContext("2d").drawImage(
                    img, 0, 0
                    , (img.width < c.width) ? img.width : c.width
                    , (img.height < c.height) ? img.height : c.height
                )
            }

            img.src = 'data:' + formattype + ',' + data
        }

        var importplugins = {
            'native': function (data, formattype, rerendercallable) {
                // we expect data as Array of objects of arrays here - whatever 'default' EXPORT plugin spits out.
                // returning Truthy to indicate we are good, all updated.
                rerendercallable(data)
            }
            , 'image': _renderImageOnCanvas
            , 'image/png;base64': _renderImageOnCanvas
            , 'image/jpeg;base64': _renderImageOnCanvas
            , 'image/jpg;base64': _renderImageOnCanvas
        }

        function _clearDrawingArea(data) {
            this.find('canvas.' + apinamespace)
                .add(this.filter('canvas.' + apinamespace))
                .data(apinamespace + '.this').resetCanvas(data)
            return this
        }

        function _setDrawingData(data, formattype) {
            var undef

            if (formattype === undef && typeof data === 'string' && data.substr(0, 5) === 'data:') {
                formattype = data.slice(5).split(',')[0]
                // 5 chars of "data:" + mimetype len + 1 "," char = all skipped.
                data = data.slice(6 + formattype.length)
                if (formattype === data) return
            }

            var $canvas = this.find('canvas.' + apinamespace).add(this.filter('canvas.' + apinamespace))

            if (!importplugins.hasOwnProperty(formattype)) {
                throw new Error(apinamespace + " is unable to find import plugin with for format '" + String(formattype) + "'")
            } else if ($canvas.length !== 0) {
                importplugins[formattype].call(
                    $canvas[0]
                    , data
                    , formattype
                    , (function (jSignatureInstance) {
                        return function () { return jSignatureInstance.resetCanvas.apply(jSignatureInstance, arguments) }
                    })($canvas.data(apinamespace + '.this'))
                )
            }

            return this
        }

        var elementIsOrphan = function (e) {
            var topOfDOM = false
            e = e.parentNode
            while (e && !topOfDOM) {
                topOfDOM = e.body
                e = e.parentNode
            }
            return !topOfDOM
        }

        //These are exposed as methods under $obj.jSignature('methodname', *args)
        var plugins = { 'export': exportplugins, 'import': importplugins, 'instance': jSignatureInstanceExtensions }
            , methods = {
                'init': function (options) {
                    return this.each(function () {
                        if (!elementIsOrphan(this)) {
                            new jSignatureClass(this, options, jSignatureInstanceExtensions)
                        }
                    })
                }
                , 'getSettings': function () {
                    return this.find('canvas.' + apinamespace)
                        .add(this.filter('canvas.' + apinamespace))
                        .data(apinamespace + '.this').settings
                }
                // around since v1
                , 'clear': _clearDrawingArea
                // was mistakenly introduced instead of 'clear' in v2
                , 'reset': _clearDrawingArea
                , 'addPlugin': function (pluginType, pluginName, callable) {
                    if (plugins.hasOwnProperty(pluginType)) {
                        plugins[pluginType][pluginName] = callable
                    }
                    return this
                }
                , 'listPlugins': function (pluginType) {
                    var answer = []
                    if (plugins.hasOwnProperty(pluginType)) {
                        var o = plugins[pluginType]
                        for (var k in o) {
                            if (o.hasOwnProperty(k)) {
                                answer.push(k)
                            }
                        }
                    }
                    return answer
                }
                , 'getData': function (formattype) {
                    var undef, $canvas = this.find('canvas.' + apinamespace).add(this.filter('canvas.' + apinamespace))
                    if (formattype === undef) formattype = 'default'
                    if ($canvas.length !== 0 && exportplugins.hasOwnProperty(formattype)) {
                        return exportplugins[formattype].call(
                            $canvas.get(0) // canvas dom elem
                            , $canvas.data(apinamespace + '.data') // raw signature data as array of objects of arrays
                        )
                    }
                }
                // around since v1. Took only one arg - data-url-formatted string with (likely png of) signature image
                , 'importData': _setDrawingData
                // was mistakenly introduced instead of 'importData' in v2
                , 'setData': _setDrawingData
                // this is one and same instance for all jSignature.
                , 'globalEvents': function () { return globalEvents }
                // there will be a separate one for each jSignature instance.
                , 'events': function () {
                    return this.find('canvas.' + apinamespace)
                        .add(this.filter('canvas.' + apinamespace))
                        .data(apinamespace + '.this').events
                }
            } // end of methods declaration.

        $.fn[apinamespace] = function (method) {
            'use strict'
            if (!method || typeof method === 'object') {
                return methods.init.apply(this, arguments)
            } else if (typeof method === 'string' && methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
            } else {
                $.error('Method ' + String(method) + ' does not exist on jQuery.' + apinamespace)
            }
        }

    } // end of GlobalJSignatureObjectInitializer

    GlobalJSignatureObjectInitializer(window)

})();

// for demo
$(document).ready(function () {
    $('#dataTables-example').DataTable({
        responsive: true
    });
    $("#signature").jSignature()
});
var viewerElement = document.getElementById('viewer');
//var myWebViewer = new PDFTron.WebViewer({
//    path: '/Content/WebViewer/lib',
//    l: 'demo:admin@kimeco.vn:7528d63d0115e37400c2a8c5bc432a19d7c2fdf8f7462e3e2b',
//    initialDoc: 'http://yinyangws.com/content/Employment_Agency.pdf',
//    fullAPI: true,
//    pdftronServer: 'http://yinyangws.com/' // replace later with your own server
//}, viewerElement);

$('#load').click(function () {

    html2canvas(document.getElementById('pageContainer2'), { onrendered: function (canvas) { var img = canvas.toDataURL("image/jpeg,1.0"); var pdf = new jsPDF(); pdf.addImage(img, 'JPEG', 0, 0); pdf.output('datauri'); pdf.save('autoprint.pdf'); } });

});
// Also see: https://www.quirksmode.org/dom/inputfile.html

var inputs = document.querySelectorAll('.file-input')

for (var i = 0, len = inputs.length; i < len; i++) {
    customInput(inputs[i])
}
$('#signature-clear').on('click', function () {
    var canvas = $('.jSignature')[0];
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

})
function downloadCanvas(canvas, filename) {
    /// create an "off-screen" anchor tag
    var lnk = document.createElement('a'), e;

    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    lnk.href = canvas.toDataURL("image/png;base64");

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null);

        lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
        lnk.fireEvent("onclick");
    }
}
$("#signature").mouseup(function () {
    var canvas = $('.jSignature')[0];
    var image = canvas.toDataURL();
    $('#SignContent').val(image);
});
$('#signature-save').on('click', function () {
    var canvas = $('.jSignature')[0];
    var context = canvas.getContext('2d');
    downloadCanvas(canvas, 'myimage.png');
})
//$(document).ready(function () {
//    var myCanvas = $('.jSignature')[0];
//    var ctx = myCanvas.getContext('2d');
//    var img = new Image;
//    img.onload = function () {
//        ctx.drawImage(img, 0, 0); // Or at whatever offset you like
//    };
//    img.src = strDataURI;
//})


var doc = new jsPDF();
var specialElementHandlers = {
    '#editor': function (element, renderer) {
        return true;
    }
};

$('#cmd').click(function () {
    doc.fromHTML($('#test').html(), 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    });
    doc.save('sample-file.pdf');
});
var url = '/Content/Employment_Agency.pdf';

var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
});
$(document).ready(function () {
    setTimeout(function () {
        var canvas = document.getElementById("the-canvas");
        var img = new Image;
        console.log(canvas.toDataURL());
        var myCanvas = $('.jSignature')[0];
        var ctx = myCanvas.getContext('2d');
        var img = new Image;
        img.onload = function () {
            ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        };
        strDataURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdwAAAKhCAYAAAD69x93AAAgAElEQVR4Xuy9Dby91Zj/fxszIoqGSU1ljIcoTSR6UiYaMZokNWnyNBhDlFJSKhRKSelRxShhUgZNNYSRSY1GHqdQmAZTfUcME0ojzav+r/ea32f/P+dq3fe+9z7n7LPPPtf9evXqe8657/XwWWtdn3Wtta7Putfdd999d5NPIpAIJAKJQCKQCCwqAvdKwl1UfDPxRCARSAQSgUSgIJCEmx0hEUgEEoFEIBGYAAJJuBMAObNIBBKBRCARSASScLMPJAKJQCKQCCQCE0AgCXcCIGcWiUAikAgkAolAEm72gUQgEUgEEoFEYAIIJOFOAOTMIhFIBBKBRCARSMLNPpAIJAKJQCKQCEwAgSTcCYCcWSQCiUAikAgkAkm42QcSgUQgEUgEEoEJIJCEOwGQM4tEIBFIBBKBRCAJN/tAIpAIJAKJQCIwAQSScCcAcmaRCCQCiUAikAgk4WYfSAQSgUQgEUgEJoBAEu4EQM4sEoFEIBFIBBKBJNzsA4lAIpAIJAKJwAQQSMKdAMiZRSKQCCQCiUAikISbfSARSAQSgUQgEZgAAkm4EwA5s0gEEoFEIBFIBJJwsw8kAolAIpAIJAITQCAJdwIgZxaJQCKQCCQCiUASbvaBRCARSATGQOCyyy5rtt9++zG+zE9WKgJJuCu15bPeiUAi0AuBa6+9tvna177WvOhFLxq8D9k+7WlPa+64447mPve5T/n9j3/84+aMM85o3vKWt/RKN19aeQgk4a68Ns8aJwKJwAgIHHHEEc2RRx7Z7L///oVMH/SgBzXPfvazm0suuaQ5+uijmze+8Y3NP//zPzevec1rmmuuuab53Oc+1+ywww4j5JCvrhQEknBXSktnPROBRGAoAj/84Q+bL37xi80LXvCCwbtbbbVVc9VVV5Wf/+RP/qR57nOf2+yzzz7l5/XXX7/52Mc+Vrzd//mf/ym/O/TQQ5ujjjqq/Pv6669v/vZv/7a317tq1ary/hve8IahZc0Xlh8CSbjLr82yxIlAIrBICGipeJNNNmn23nvv5tWvfnWzxRZbNF/5yldKjni0F1544YCA+d173/ve5txzz234lueFL3xhIdiTTz65OeWUU8rv7r777l4lvvnmm5vnPe95zZVXXtnr/XxpeSEwNYTLrHLbbbedg95b3/rW5k1vetOCI8oM8kMf+lAZDPvuu2/Zm9GM9mc/+1n592c+85mJlGXBK5cJJgKJwNgIXHDBBYXw9DzsYQ9rPvrRjzZ/93d/V5aKDzvssGaPPfaYkz4Hp1772tc2Bx10UHPccceVZWXI9r//+78H741CuOuuu25vgh67ovnhkiAwVYTLHsj555/fPOYxjynLOv7zQqLTRbjKh+Wh173udc122203Z3lpIcuRaSUCicB0IcChJzxbPSwhs2z8yle+svn5z3/enHXWWYV84/Ov//qvzeMe97jmd37nd5pPfOITc0h7VA8X0j7++OOnC5gszYIgsCwIlxnmm9/85lLhZz7zmc373//+5m1ve9uADCHQK664osw8DzjggOahD31o84d/+Idl+Yf9lDPPPLN8K495HMKNHjiHJB772McWMn7KU57SPP3pTy8eOr/n53wSgURg+SHA4SgOSel52cte1tx1112FRFn14oCUlo69dhyg+u3f/u3mGc94Rjmp/KpXvWpO5UfxcJNwl1+/6VviqSLcuKT84Q9/eI53+d3vfrd5/vOf35x22mkNhxsgWQ4nsMyDJ/rwhz98DumJiN/97nc3t99+e0mLJWq+bVtSHubhyvNdb731SlpOxLG8fRsh30sEEoGlQeBe97rXIONtttmmecUrXtG89KUvHfzu7W9/e3PxxRcP9mz/6Z/+qZxYdtI99thjyz4vB6d4zj777DlpcKoZz9iXqlmGJq34sIebhLs0fWESuU4V4bYtIde8y4c85CFl34RDDe95z3vKnslPf/rT4vlCtA9+8IPLv3kgRl8i5nejEm7c25W3rHQhceU7iYbLPBKBRGD+CGy22WYNy8E8j3zkI5u/+Zu/GRAnv8Nbfde73lVOG/MQcwsB77bbbs1tt93W7LTTTs3rX//6Od+wAsd21C9/+cvyDY7A4Ycf3vzVX/3VoMCcctaBKq9FEu7823SaU5h6wsWrhVghVB55uE984hNLp2a5mP0VvNivf/3rcwhXS8f8n2dcD5eZqfZz9W95uKTNjJRlbDz0xTjkNc0dKMuWCCxnBFgtU4jPAx7wgOab3/xm2Y7SQ8jPX//1X885ALXLLrs0hAqxvPy+972vOeaYY5p///d/H3yDLTr99NOb733ve+V3T3jCE8rJZYhZT1usbhLucu5Nw8s+9YQrDxJiffzjH1+I7cUvfnEhT3m+2jflZ/dw/Vug0JLvOHu4fMOgEemzTMThipe85CVliRuPm8kAJxU9hm94E+QbiUAisJQI/MVf/EXzb//2b4VYd91112bttdceFIdlXy0VexkJAyIciKVh3/PlHX5myVnLzryDaAbLyhdddNGcON1Y7yTcpewJi5/31BDuOFWNBDtOGvlNIpAIrGwEvvSlLzW//vWvmw9+8IPNk570pOYf//Efm7//+78voDDRP/XUU4vn6w8eLh4rq2//+Z//OedvLCm/4x3vGCxDs6f7D//wD80f/dEflT3i3//9328FPAl3tvvisiVcPFlOLudBpdnuoFm7RGAxEbj00ksLoYpg8UZZoYIYeQ488MDmRz/6URG28OfP/uzPCjlH75Z3OM2sPV5+xnt+9KMfXT6HbPGk24g3CXcxW3vp0162hLv00GUJEoFEYDkjgIdai3f91Kc+VbSSeXbeeedyAjmezWDfl0NReMXx+cIXvtD88R//cfk15I03jMCOPxAvalSQrz9JuMu5Rw0vexLucIzyjUQgEZgxBGK8rVePUENOIrPUvOGGG5b4/T333HMOAieccELzkY98ZCD56H/0fV9W4Dj/QZxu7eFdv+KvD+GyD/z973+/ufe9711EOYj95cCXHiYC5513Xikfj8KPOHGNsJB+x940eU/ydiNEQ5jQENVBvivtesMk3BkzJFmdRCAR6IcAXioHHuODYhSRBy9/+cvLcjLLzsi/+l7tJz/5ySK086tf/WrO53jEz3rWs4pKHvG8HPCsHbriI5ajI9kNI1zyjEpXeMv8jjhiHpa0KcOf//mfN/e9732LFw5Jc7qaaIuf/OQnZStuKQgXPG688cZCtKwCJOH266v5ViKQCCQCyx4ByAhvMHqgkC5eLHu17ONCXL5fi9gFh6MU+iMgIDI8ZKIYLr/88iL16M9GG21Uwgf32muvKtl0ES57xtzLSx6o2aFsRRlULqQnH/jABxZhDn7n6laQK6em/Xd+ilplxHNGcwANaSJC9DCx4F7gtdZaq3nUox7V2e56Fy2ERzziEXPeRWikNtFY9h2pZwXSw+0JVL6WCCQCs4sAFw1AuldffXXzX//1X8Wb/c1vftMcfPDBxcPdYIMNmltuuaV55zvfWVTrELx48pOfPCA79N85yImnef/73794mxzGIpSRvyEDC2H+wR/8QSeI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k8Bhhx02bNl1heC+9dZb6cwzz2wE8h+22jsjEzABEzCB2hI4//zz009/+tNhq3/XCO6NN97YOPd12GrvjEzABEzABGpLgBPaOIp1uC4L7nCRdj4mYAImYAJdRcCCm1L66KOP8kHuRx11VFprrbX61UDxHNr+ptGfjDk16NBDD01nnHFGOuKII5KO7Nthhx3y4fKcoTtUF3kPdR4qO+cDb7zxxmm33XbLv/LRhEPVqk7XBExgqAhYcJsIroRsxYoViYPk11133SxsEydOTDvuuGM65JBDehzUfv311ydexOJgeAQ3Pq+D3C+++OJ000035YPe77rrrixWb7/9drriiivy7zlwfuedd07XXHNNuvLKK9N5552XjjvuuPyzRDym+/DDD6e77747P0sZt9tuuyywr732WrrwwgvTggUL0rPPPpuFijTuueeedOSRRybKg4Cts846uV/x7/j79957L9dVdednBO7jjz9Oe++9dz64nmc+97nPpXfeeScdffTRWewXLVrUg5Wel0jyzCuvvJLrddFFF2WGlP/5559Pp556aq6rnlGH51nK/sknn6Rddtkl142y8vwmm2yS9ttvv0be8+fPT0w0lObs2bMbdRyqAeR0TcAETKBdAhbcJoJ78803p8mTJ2eOCOGYMWOy0HDdcsstWdAkggjCrrvumhYvXtxDcHUf+8X7779/2nzzzRsChwg+8sgjWTQQiXgvoo64SdiiZ0depMUEgHIhSIg2ghc9P9LUebm33XZbLh/iO23atB7eId494n7CCSeksWPHpg8//DALc6z7hhtumNZcc80sbuTJpAJx23rrrdOSJUvSl770pSzqlIlJxLhx43o8r0mIBJefyXOfffbJkwJYipHqdeCBB2Y+xx9/fF59WGONNdJ6662Xli9fnvPnediR1xZbbJEmTJjwmTSHc6Wh3QHn+0zABOpLwIJbIbiIEJ4iniMXHiFiw5IzoqTlZ3mheKzcWwqullvZJEcUnn766eydceGRPvnkk1k8uXQvgrr++uunww8/vNErETcENS5980fy33777dPKlSsrBTfmz4Rh1qxZ2YPkwkM899xzGyK9++67Z8973rx5ac6cOT3qfvDBB6etttoqizvlw8PHK91zzz17CCwecxU7edNxWRgmlOmFF15oiCp8Va9jjjkmzZ07N3vUeNgffPBB9qjhT6fV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ur3DuHwmYAImYAL9IzDqBZeoP8S21XeeZQxXsLEErLfh+H4yfgeI4JbfDZavqcclZQIEKFYwafONX/ldW1Vkmv41n58yARMwARMYKQRGveASD1SxR2OEHrzV3jxcGhChRXxLwY0xgPGY8WA322yzRnQVebj6hCZGnWkWe3WkdBiX0wRMwARMoH8ERq3gan+W/xMBpd09XMK3sb9KZCOiElUJbvyurdUeLnvDnL6BIMfILXjaXARqLyMW9a8p/ZQJmIAJmEA3ExjVgtvN4F02EzABEzCBehGw4NarvV1bEzABEzCBDhGw4HYIvLM1ARMwAROoFwELbr3a27U1ARMwARPoEAELbofAO1sTMAETMIF6EbDg1qu9XVsTMAETMIEOEbDgdgi8szUBEzABE6gXAQtuvdrbtTUBEzABE+gQga4R3FYHDd97771piy22SBzAzYEDXAM5ALwqPyJCHXnkkTkcI//u62HrCohBuZqdGNTXk4WoJ+nGGNDt9JXyGWJLn3baaemmm25qPF4e5NAq3XYOZ2+VRjt/18ETsXxEBZsxY0a67rrrch/oz1V1SlMMYjJ//vwchISY2BxOUV7ttEOMXtafMg7GMyonYU3nzp2bTj/99KQ44L2l35/2becZxittuu2226aHHnoo7bzzzumSSy7p8/hqVnalH8cs//7JT36SysPW+8J3KGxEzL8q3jthYcm3mf1RmTiQpYyAV9atLH9Vfu2MpWZtTF8noNAZZ5xROV76wpp7+1u+vubTyftHhODSsC+++GI66KCDsvhcfvnlmdlZZ52VB60MNFGdtt9++zRt2rQepwAhgMcee2xatGhR2mabbdK8efPSnDlzsmFVxybde+65Jz9bNdDiqUKkhyEjhOMFF1zQEACeY2JAPGXELRpffr/++uun888/Pxt1ok+9+eab6bzzzksYegx8KfgIDmmuvvrqaezYsYlDD84+++wsmpw6RDnKZ9577708CDBqG2ywQcPY0pkJK0lM6Wh8MUhvv/12uuKKK3K6CDvPkvZ3v/vd9MYbb6QXXngh3XXXXenpp5/OZSdEZnkaEu0xefLkpFjVpEPddAoTbJtNZkq2tNU777yT85RBoJ6vvPJKjswFKw32iRMnph133DEdf/zxuf1iHgsXLsw/czU7pUkTuQkTJjTKTjrUpZxw0UfOOeectHTp0tyWlIlL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xohTLJnG6Dj8G/FTUGwtV8ZITIqAE/dwW0XJaeXhai+2KoJPux5ub1FZ+iK4zTzcqjKSrmJQK+KV9nD5W9ynbjfqkbzgMtJQO3u4Euv4wlX8rlbtrzbX3i9Rf/B+tfIxkmKo1sOcuJYmYAK9EegqwY0nVLjZTMAETMAETGA0EbDgjqbWdF1MwARMwAS6lkDXCG7XEnLBTMAETMAETGAQCFhwBwGikzABEzABEzCBVgQsuK0I+e8mYAImYAImMAgELLiDANFJmIAJmIAJmEArAhbcVoT8dxMwARMwARMYBAIW3EGA6CRMwARMwARMoBUBC24rQv67CZiACZiACQwCAQvuIEB0EiZgAiZgAibQioAFtxUh/90ETMAETMAEBoGABXcQIDoJEzABEzABE2hFwILbipD/bgImYAImYAKDQMCCOwgQnYQJmIAJmIAJtCJgwW1FyH83ARMwARMwgUEgYMEdBIhOwgRMwARMwARaEegKwf3444/Teeedl1ZfffVW5fXfTcAETKBfBH72s5+lbbfdtl/P+qHRSeCTTz5Jm2yySTruuOOGpYJdIbhvvfVWuuqqq9KZZ545LJV2JiZgAvUjcOihh6a77rqrfhV3jZsS+NWvfpXuuOOOrD/DcXWN4N54443p4osvHo46Ow8TMIEaEvjGN76R7r///hrW3FVuRuDNN99MN998c7rwwguHBZIFd1gwOxMTMIFOE7DgdroFui9/C273tYlLZAImMAoIWHBHQSMOchUsuIMM1MmZgAmYAAQsuO4HJQELrvuECZiACQwBAQvuEEAd4UlacEd4A7r4JmAC3UnAgtud7dLJUllwO0nfeZuACYxaAhbcUdu0/a6YBbff6PygCZiACTQnYMF17/AebkqJwBf+DteDwQRMYCgJWHCHku7ITNse7shsN5faBEygywlYcLu8gTpQPAvup9CfeOKJtPvuu+efLrroonTCCSekG264IZ1++ulprbXW6lfTfPTRR+nKK6/Maa2zzjr9SsMPmYAJjEwCUXCxBaeddlq66aabcmX23XffHOKvtAsjxWYQLWny5MlDbtdeeuml9OKLL6aDDjpoZHaCotQW3JRS2cmvueaatOuuu6bFixenE088MZ199tlp6dKlacqUKWmfffZJ559/flq0aFHaZpttGrFSiZu6YsWK9Pjjj6ctttgiHXHEEWn8+PFpo402SmedddaQd8xR0RtdCRMYRQRKwb399tvTUUcdlSfwTPAfeeSRPBnHVmBPEOEZM2akAw44IM2fPz+TOPLII5uKc6dQYS+xjcMhgv/8z/+ceW2++eadqu6g5mvB/RQns00GhGad77//fvZwd9ttt/T222/n2RxCi+jeeuut6ZJLLkkLFy5MG2+8cXr++efz37l4ZsMNN0ybbbZZWnfdddMFF1yQZs+ebcEd1G7rxEyg+wn0JriIVhRgasNEf++990733XdfOuyww9Kjjz6apk2blsX5tddey8LcDRdeJ+X/67/+6yEvzr333pudnP6uMg55AfuYgQU3AENk6dTvvPNOXvphFofgjhkzJv+fxl9//fXz71lqfuaZZxJH/d199909lor222+/PJMdO3asl5T72CF9uwmMFgLtCi7bThwXyorZvHnzsuAiMhzhxqoZF9tc5557blegwQ6yijfUXif2+J577smTjtFyWXBTSvJmtV/LjPK5555L7777bqWHGwWXjiAPV/sxeMl4vnTKc845J3vD3sMdLUPG9TCB9gi0s6SMR8u13Xbb5RU0Jvylh9tebsN313B5ncPpSQ8XPQvup6QRSfZLuJhZMpucO3du5R5uKbgsHWsPV88ee+yx2VPeeeedLbjD1Zudjwl0EYF2Xpp67733su3gwqtlX5S9XS4OKpdNYk+3G5aUcU5Y2fva17425KR/9KMf5YnIaHJWLLh96Dbssey///5DvpTShyL5VhMwgS4l4M+CurRhOlgsC24L+CxryHvtpn2UDvYZZ20CJtAGAQtuG5BqdosFt2YN7uqagAkMDwEL7vBwHkm5WHBHUmu5rCZgAiOGgAV3xDTVsBXUgjtsqEdPRiyzP/jgg+lLX/pS46UOAn7w6VRv11B+xB4j3ygfXkhpVSZelnvllVdysceNG5eDDvAN9VBdevPyqaeeahmph7flW5V/KJm2+5YoZeATkWbfSuqt/VZ1GSrmnUrXgtsp8t2brwW3e9uma0umtwd5WzG+RXjxxRfn7wl18WYlYsbveHv729/+dvr85z+f5syZk79bZk986623ziE1FyxYkNZYY410zDHH5HsPOeSQNHPmzBzJS9/7KfymvlckGABvdvLW+LPPPvuZfJYtW9YjTV5641KIPd5EJ0+CDNx5550JA/kv//IvjbQoHxfl1785+KJMp9XfqKPKufbaa+dABkpXdZ00aVLjO0z4MJkhgAoDFK7kobdWy2fEKPLhd3wfXpaddJVeszLE9PTGrNqQuiOsamvKxbfp1FHfjfJ2P+zVxnxuN1yRibpp0IwkwY1faZST53YnXu2wb/VJUX/ywh5tueWW6YEHHmhE8hrOt6nbqbfuseD2hZbvzQQ0aPgoXZ8tMEj5HvnrX/969n6JyMXvuCQ2q1atSl/+8pfT//7f/zt/VoBXijf5v/7X/8pGmwheGGkElXCYEyZM6OHhyZsjTQR2zTXXbKRd5vOXf/mXjfwRcXlfcSCS/7/5N/8m7bXXXvnev/iLv8jfXxNFh4/tFQhFYfcU0ITPFMp0fv/73+fBrk8YECQmEXDge+z/8B/+QxYdvs+GgzxcGKoMeOTUa+XKlemb3/xm+sEPfpB22mmnNHXq1HTKKac0RAw+f/d3f5cQ6T/90z/NjBHnyIf0mfCUZddnKKRHvnyGQnt++OGHmbcuvFGMH23D5226TwEP9DLhGWeckZ+lHWlDPpH76U9/mn71q1/lusNAdVFYw7oMo5EkuOUnOJpQaXLHZK6c8MUJcXk/fTPGi676e5w4M+lmLDA+/vCHP+SVJl3NJqWa0HEf/VUBiJgEwn611VbLEbqUNv04TkA1iaya3A9VH7XgDhXZUZyuBiehLSW48nRKwUVA+Bb51VdfzUL6xS9+sYfnhfejAx6UngYYEb4QCBl5xZ/Fm+J3pQdXetJVHm7pnVE2vHQJbm8eLoISA7aXXp7+FgPVUxdEU5779OnTc/hQDAtvv2Nk5B3SZYg0RLklUs08XNJBiLlKj7SKj8pO6FEZndKAwrsU3FtuuSVNnDixUf5mHi6TFlYJfve73+X7MZpRcH/yk58MS+zdbhp2I0lwSw9XwXzUP+Ha24SY56+44oo81lk5YmxwaTVIYSyZqCGE9F3G8Mknn5wnbFxM+BjvujT2X3/99TxJp4/FSan617/9t/82bbvtttnD1e+wNYwDTfr/7M/+rBEDn4nAwQcfnFfaKO+BBx6YvvCFL7TcvhmMvmXBHQyKNUtDe7gszba68CL/x//4H4lAIFWh4LSH2ixs3S9+8YvsNfKfBBeh6IYgAK3qPtx/7ySf+PlcuSQ5XKEAh5t3q/xGquBq8swEUoLLSkWceOEVKuQtHDT5jAcwRA9Xgh69VZ7TYS9MBJmUIvSExOWKgotg8myclEpc2Rbi0iSPiR9bJ9/61rd6RBFUCM24VaTyWnBb9eYB/J19uFNPPTX97d/+7QBS8aMmYAIm0JzAmWeemb7zne8YUQsC//AP/5DWW2+9tOeeew46q6FMuz+FZSuKFUJW54bjWm0VG1hdcP3TP/1TF5TCRTABExitBNhH/+pXvzpaq+d6DYAA73QMx9U1gjsclXUeJmACJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ImDBrVVzu7ImYAImYAKdImDB7RR552sCJmACJlArAhbcWjW3K2sCJmACJtApAhbcTpF3viZgAiZgArUiYMGtVXO7siZgAiZgAp0iYMHtFHnnawImYAImUCsCFtxaNbcrawImYAIm0CkCFtxOkXe+JmACJmACtSJgwa1Vc7uyJmACJmACnSJgwe0UeedrAiZgAiZQKwIW3Fo1tytrAiZgAibQKQIW3E6Rd74mYAImYAK1ItA1gvvEE0+k22+/PR1//PHp8ssvT7Nnz04LFy5MG2+8cXrttdfSK6+8ks4999zEfY888kj+t6477rgjjRs3Lj377LPpwAMPTPy86aabpj/90z/Nt+hv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"
        img.src = strDataURI;
    }, 5000);
})