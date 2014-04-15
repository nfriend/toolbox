'use strict';

angular.module('yourModuleNameHere')
    .directive('dragZoom', ['dragZoomSynchronizer', function (dragZoomSynchronizer) {
        return {
            templateUrl: 'views/drag-zoom.html',
            transclude: true,
            link: function (scope, elem, attr, ctrl) {

                var targetElement = elem.find(".drag-zoom-content");
                var innerContainer = elem.find(".inner-container");
                //targetElement.append('<div class="scroll-shim"></div');

                dragZoomSynchronizer.add('left', targetElement).add('width', targetElement).add('top', targetElement).add('height', targetElement);

                // handles zooming
                targetElement.bind('mousewheel', function (e) {
                    e.preventDefault();
                    // base calculations on what the element's width *should* be, not what it is currently - the element
                    // might be in the middle of another zooming animation
                    var targetElemFinalWidth = innerContainer.width() * dragZoomSynchronizer.zoom;

                    // where the mouse was (on the x-axis) in relation to the element.
                    // this uses the REAL width of elem, because it's important that we zoom 
                    // relative where the mouse is right now
                    var ratio = (e.clientX - targetElement.offset().left) / targetElement.width();

                    if (e.originalEvent.wheelDelta > 0) {
                        // if we zoomed in

                        // limit the zoom to level 5
                        if (dragZoomSynchronizer.zoom !== 7) {
                            var changeInWidth = targetElemFinalWidth * ((dragZoomSynchronizer.zoom + 1) / dragZoomSynchronizer.zoom) - targetElement.width();
                            dragZoomSynchronizer.get('width').stop('zoomQueue', true)
                                .animate({
                                    width: (dragZoomSynchronizer.zoom + 1) * 100 + "%"
                                }, {
                                    duration: 350,
                                    queue: 'zoomQueue'
                                }).dequeue('zoomQueue');

                            dragZoomSynchronizer.get('left').stop('leftQueue', true)
                                .animate({
                                    left: "+=" + (-1 * changeInWidth * ratio),
                                }, {
                                    duration: 350,
                                    queue: 'leftQueue',
                                    always: sanityCheck
                                }).dequeue('leftQueue');

                            scope.$apply(function () {
                                dragZoomSynchronizer.zoom++;
                            });
                        }
                    } else {
                        // if we zoomed out

                        // limit the zoom to level 1
                        if (dragZoomSynchronizer.zoom !== 1) {
                            var newWidth = targetElemFinalWidth * ((dragZoomSynchronizer.zoom - 1) / dragZoomSynchronizer.zoom);
                            var changeInWidth = targetElemFinalWidth - newWidth;
                            var newLeft = parseFloat(targetElement.css('left')) + (changeInWidth * ratio);

                            newLeft = newLeft > 0 ? 0 : newLeft;
                            newLeft = newLeft < -1 * newWidth + innerContainer.width() ? -1 * newWidth + innerContainer.width() : newLeft;

                            dragZoomSynchronizer.get('width').stop('zoomQueue', true)
                                .animate({
                                    width: (dragZoomSynchronizer.zoom - 1) * 100 + "%"
                                }, {
                                    duration: 350,
                                    queue: 'zoomQueue'
                                }).dequeue('zoomQueue');
                            dragZoomSynchronizer.get('left').stop('leftQueue', true)
                                .animate({
                                    left: newLeft + "px",
                                }, {
                                    duration: 350,
                                    queue: 'leftQueue',
                                    always: sanityCheck
                                }).dequeue('leftQueue');

                            scope.$apply(function () {
                                dragZoomSynchronizer.zoom--;
                            });
                        }
                    }
                });

                // handles dragging

                // stores the mouse coordinates of the last drag call; used for calculating velocity
                var lastCoordinates = { x: 0, y: 0 };
                // stores how fast the element is currently being dragged
                var velocity = { x: 0, y: 0 };

                var initialPosition = { clientX: 0, clientY: 0, scrollLeft: 0, scrollTop: 0 };
                innerContainer.scrollLeft(200).scrollTop(200);
                var mouseMoveHandler = function (e) {
                    velocity = {
                        x: lastCoordinates.x - e.clientX,
                        y: lastCoordinates.y - e.clientY
                    };
                    lastCoordinates = {
                        x: e.clientX,
                        y: e.clientY
                    };

                    var newTop = initialPosition.scrollTop + initialPosition.clientY - e.clientY;
                    var newLeft = initialPosition.scrollLeft + initialPosition.clientX - e.clientX;

                    var rubberBandEffect = 0;
                    if (newTop < 200) {
                        rubberBandEffect = Math.atan(((newTop - 200) / 400)) * -200;
                        newTop = newTop < 200 ? 200 - rubberBandEffect : newTop;
                    } else if (newTop > targetElement[0].scrollHeight - innerContainer.height() - 200) {
                        rubberBandEffect = Math.atan(((targetElement[0].scrollHeight - innerContainer.height() - 200) - newTop) / 400) * -200;
                        newTop = (targetElement[0].scrollHeight - innerContainer.height() - 200) + rubberBandEffect;
                    }

                    if (newLeft < 200) {
                        rubberBandEffect = Math.atan(((newLeft - 200) / 600)) * -200;
                        newLeft = 200 - rubberBandEffect;
                    } else if (newLeft > targetElement[0].scrollWidth - innerContainer.width() - 200) {
                        rubberBandEffect = Math.atan(((targetElement[0].scrollWidth - innerContainer.width() - 200) - newLeft) / 400) * -200;
                        newLeft = (targetElement[0].scrollWidth - innerContainer.width() - 200) + rubberBandEffect;
                    }

                    innerContainer.scrollTop(newTop).scrollLeft(newLeft);
                }

                $(window).on('mouseup', function (e) {
                    $(window).off('mousemove', mouseMoveHandler);

                    var newTop = innerContainer.scrollTop() + velocity.y * 10;
                    newTop = newTop < 200 ? 200 : newTop;
                    newTop = newTop > targetElement[0].scrollHeight - innerContainer.height() - 200 ? targetElement[0].scrollHeight - innerContainer.height() - 200: newTop;

                    var newLeft = innerContainer.scrollLeft() + velocity.x * 10;
                    newLeft = newLeft < 200 ? 200 : newLeft;
                    newLeft = newLeft > targetElement[0].scrollWidth - innerContainer.width() - 200 ? targetElement[0].scrollWidth - innerContainer.width() - 200: newLeft;

                    innerContainer.stop().animate({
                        scrollTop: newTop,
                        scrollLeft: newLeft
                    }, {
                        duration: 800,
                        easing: 'easeOutQuart'
                    });
                });

                targetElement.on('mousedown', function (e) {
                    innerContainer.stop();
                    initialPosition = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        scrollLeft: innerContainer.scrollLeft(),
                        scrollTop: innerContainer.scrollTop(),
                    }

                    $(window).on('mousemove', mouseMoveHandler);
                });

            }
        };
    }]);
