// attach to appropriate angular module

.directive('dragZoom', ['gridPosition', function (gridPosition) {
    return {
        link: function (scope, elem, attr, ctrl) {

            var finalLeft = parseFloat(elem.css('left'));

            // handles zooming
            elem.bind('mousewheel', function (e) {
                // base calculations on what the element's width *should* be, not what it is currently - the element
                // might be in the middle of another zooming animation
                var elemFinalWidth = elem.parent().width() * gridPosition.zoom;

                // where the mouse was (on the x-axis) in relation to the element.
                // this uses the REAL width of elem, because it's important that we zoom 
                // relative where the mouse is right now
                var ratio = (e.clientX - elem.offset().left) / elem.width();

                if (e.originalEvent.wheelDelta > 0) {
                    // if we zoomed in

                    // limit the zoom to level 5
                    if (gridPosition.zoom !== 5) {
                        var changeInWidth = elemFinalWidth * ((gridPosition.zoom + 1) / gridPosition.zoom) - elem.width();
                        elem.stop('zoomQueue', true).stop('leftQueue', true)
                            .animate({
                                width: (gridPosition.zoom + 1) * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'zoomQueue',
                                step: function (now, fx) {
                                    scope.$apply(function () {
                                        gridPosition.width = now;
                                    });
                                }
                            })
                            .animate({
                                left: "+=" + (-1 * changeInWidth * ratio),
                            }, {
                                duration: 350,
                                queue: 'leftQueue',
                                always: sanityCheck,
                                step: function (now, fx) {
                                    scope.$apply(function () {
                                        gridPosition.left = now;
                                    });
                                }
                            }).dequeue('zoomQueue').dequeue('leftQueue');

                        scope.$apply(function () {
                            gridPosition.zoom++;
                        });
                    }
                } else {
                    // if we zoomed out

                    // limit the zoom to level 1
                    if (gridPosition.zoom !== 1) {
                        var newWidth = elemFinalWidth * ((gridPosition.zoom - 1) / gridPosition.zoom);
                        var changeInWidth = elemFinalWidth - newWidth;
                        var newLeft = parseFloat(elem.css('left')) + (changeInWidth * ratio);

                        newLeft = newLeft > 0 ? 0 : newLeft;
                        newLeft = newLeft < -1 * newWidth + elem.parent().width() ? -1 * newWidth + elem.parent().width() : newLeft;

                        //newLeft = 

                        elem.stop('zoomQueue', true).stop('leftQueue', true)
                            .animate({
                                width: (gridPosition.zoom - 1) * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'zoomQueue',
                                step: function (now, fx) {
                                    scope.$apply(function () {
                                        gridPosition.width = now;
                                    });
                                }
                            })
                            .animate({
                                left: newLeft + "px",
                            }, {
                                duration: 350,
                                queue: 'leftQueue',
                                always: sanityCheck,
                                step: function (now, fx) {
                                    scope.$apply(function () {
                                        gridPosition.left = now;
                                    });
                                }
                            }).dequeue('zoomQueue').dequeue('leftQueue');

                        scope.$apply(function () {
                            gridPosition.zoom--;
                        });

                        finalLeft = newLeft;
                    }
                }
            });

            // handles dragging

            // stores the mouse coordinates of the last drag call; used for calculating velocity
            var lastCoordinates = { x: 0, y: 0 };
            // stores how fast the element is currently being dragged
            var velocity = { x: 0, y: 0 };

            // make the element draggable with jQuery UI's .draggable() function
            elem.draggable({
                drag: function (e) {
                    // stop any other drag animations happenning currently
                    elem.stop('draggableQueue', true).stop('leftQueue', true)
                    velocity.x = e.clientX - lastCoordinates.x;
                    velocity.y = e.clientY - lastCoordinates.y;
                    lastCoordinates.x = e.clientX;
                    lastCoordinates.y = e.clientY;

                    scope.$apply(function () {
                        gridPosition.left = parseFloat(elem.css('left'));
                        gridPosition.top = parseFloat(elem.css('top'));
                    });
                },
                stop: function (e) {
                    // calling elem.width() right now may not give use a good value to use, as the element might be being zoomed in/out
                    // instead, use the width that the element *will* have once all zomming in/out operations are complete
                    var elemWidth = elem.parent().width() * gridPosition.zoom;

                    // calculate the final points of the element, with inertia
                    var newLeft = parseFloat(elem.css('left')) + velocity.x * 20;
                    var newTop = parseFloat(elem.css('top')) + velocity.y * 20;

                    // ensure that the end position of the element is never beyond its parent's bounds
                    newLeft = newLeft < -1 * elemWidth + elem.parent().width() ? -1 * elemWidth + elem.parent().width() : newLeft;
                    newLeft = newLeft > 0 ? 0 : newLeft;
                    newTop = newTop < -1 * elem.height() + elem.parent().height() ? -1 * elem.height() + elem.parent().height() : newTop;
                    newTop = newTop > 0 ? 0 : newTop;

                    finalLeft = newLeft;

                    //// create a "elastic" effect when animting to the edges
                    //var leftEasing = 'easeOutQuart';
                    //var topEasing = 'easeOutQuart';
                    //if (newLeft === 0 && currentLeft < 0) {
                    //    leftEasing = 'easeOutBack';
                    //}
                    //if (newTop === 0 && currentTop < 0) {
                    //    topEasing = 'easeOutBack';
                    //}

                    // stop any other drag animations happenning currently and start new ones
                    elem.stop('draggableQueue', true).stop('leftQueue', true)
                        .animate({
                            top: newTop
                        }, {
                            duration: 650,
                            easing: 'easeOutQuart',
                            queue: 'draggableQueue',
                            step: function (now, fx) {
                                scope.$apply(function () {
                                    gridPosition.top = now;
                                });
                            }
                        }).animate({
                            left: newLeft
                        }, {
                            duration: 650,
                            easing: 'easeOutQuart',
                            queue: 'leftQueue',
                            always: sanityCheck,
                            step: function (now, fx) {
                                scope.$apply(function () {
                                    gridPosition.left = now;
                                });
                            }
                        }).dequeue('draggableQueue').dequeue('leftQueue');
                }
            });

            function sanityCheck() {
                //if (!elem.is(':animated') && !elem.is('.ui-draggable-dragging')) {
                //    var left = parseFloat(elem.css('left'));
                //    if (left > 0) {
                //        console.log("good thing we checked, elem was too far to the right!");
                //        elem.stop('leftQueue').animate({
                //            left: "0px"
                //        }, {
                //            duration: 800,
                //            easing: 'easeOutQuart',
                //            queue: 'leftQueue'
                //        }).dequeue('leftQueue');
                //    } else if (left < -1 * elem.width() + elem.parent().width()) {
                //        console.log("good thing we checked, elem was too far to the left!");
                //        elem.stop('leftQueue').animate({
                //            left: -1 * elem.width() + elem.parent().width() + "px"
                //        }, {
                //            duration: 800,
                //            easing: 'easeOutQuart',
                //            queue: 'leftQueue'
                //        }).dequeue('leftQueue');
                //    }
                //}
            }

        }
    };
}]);

// include this service: 
.factory('gridPosition', function () {
    return {
        left: 0,
        top: 0,
        width: 100,
        height: 0,
        zoom: 1
    };
});