'use strict';

angular.module('yourModuleNameHere.directives')
    .directive('dragZoom', ['dragZoomSynchronizer', function (dragZoomSynchronizer) {
        return {
            templateUrl: 'views/drag-zoom.html',
            transclude: true,
            link: function (scope, elem, attr, ctrl) {

                var widthZoomLevels = [1, 1.5, 2, 2.5, 3, 4];
                var heightZoomLevels = [1, 1.5, 2];

                //var widthZoomLevels = [1, 2, 3, 4, 5, 6];
                //var heightZoomLevels = [1, 2, 3];

                var targetElement = elem.find(".drag-zoom-content");
                var innerContainer = elem.find(".inner-container");

                dragZoomSynchronizer.add('scrollLeft', innerContainer).add('width', targetElement).add('scrollTop', innerContainer).add('height', targetElement);

                // handles zooming
                targetElement.bind('mousewheel', function (e) {
                    e.preventDefault();

                    var targetElemFinalWidth = targetElement.width(); // * widthZoomLevels[dragZoomSynchronizer.widthZoom];
                    var targetElemFinalHeight = targetElement.height();// * dragZoomSynchronizer.heightZoom;

                    // how far the scroll bar is currently scroll, as a ratio
                    var leftRatio = (innerContainer.scrollLeft() - 200) / (targetElement[0].scrollWidth - 400);
                    var topRatio = (innerContainer.scrollTop() - 200) / (targetElement[0].scrollHeight - 400);

                    if (e.originalEvent.wheelDelta > 0) {
                        // if we zoomed in

                        if (dragZoomSynchronizer.widthZoom < widthZoomLevels.length - 1) {
                            var newWidth = targetElemFinalWidth * ((widthZoomLevels[dragZoomSynchronizer.widthZoom + 1]) / widthZoomLevels[dragZoomSynchronizer.widthZoom]);
                            dragZoomSynchronizer.get('width').stop('widthZoomQueue', true).animate({
                                width: widthZoomLevels[dragZoomSynchronizer.widthZoom + 1] * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'widthZoomQueue'
                            }).dequeue('widthZoomQueue');

                            var newScrollLeft = ((newWidth) * leftRatio + 200) + (e.clientX - innerContainer.offset().left - innerContainer.width() / 9) * ((widthZoomLevels[dragZoomSynchronizer.widthZoom + 1] - widthZoomLevels[dragZoomSynchronizer.widthZoom]) / widthZoomLevels[dragZoomSynchronizer.widthZoom]);

                            dragZoomSynchronizer.get('scrollLeft').stop('scrollLeftQueue', true).animate({
                                scrollLeft: newScrollLeft
                            }, {
                                duration: 350,
                                queue: 'scrollLeftQueue'
                            }).dequeue('scrollLeftQueue');
                        }

                        if (dragZoomSynchronizer.heightZoom < heightZoomLevels.length - 1) {
                            var newHeight = targetElemFinalHeight * (heightZoomLevels[dragZoomSynchronizer.heightZoom + 1] / heightZoomLevels[dragZoomSynchronizer.heightZoom]);
                            dragZoomSynchronizer.get('height').stop('heightZoomQueue', true).animate({
                                height: (heightZoomLevels[dragZoomSynchronizer.heightZoom + 1]) * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'heightZoomQueue'
                            }).dequeue('heightZoomQueue');

                            var newScrollTop = ((newHeight) * topRatio + 200) + (e.clientY - innerContainer.offset().top) * ((heightZoomLevels[dragZoomSynchronizer.heightZoom + 1] - heightZoomLevels[dragZoomSynchronizer.heightZoom]) / heightZoomLevels[dragZoomSynchronizer.heightZoom]);

                            dragZoomSynchronizer.get('scrollTop').stop('scrollTopQueue', true).animate({
                                scrollTop: newScrollTop
                            }, {
                                duration: 350,
                                queue: 'scrollTopQueue'
                            }).dequeue('scrollTopQueue');
                        }

                        if (dragZoomSynchronizer.widthZoom < widthZoomLevels.length - 1 || dragZoomSynchronizer.heightZoom < heightZoomLevels.length - 1) {
                            scope.$apply(function () {
                                dragZoomSynchronizer.widthZoom++;
                                dragZoomSynchronizer.heightZoom++;
                            });
                        }
                    } else {
                        // if we zoomed out

                        if (dragZoomSynchronizer.widthZoom > 0 && dragZoomSynchronizer.widthZoom < widthZoomLevels.length) {
                            var newWidth = targetElemFinalWidth * ((widthZoomLevels[dragZoomSynchronizer.widthZoom - 1]) / widthZoomLevels[dragZoomSynchronizer.widthZoom]);
                            dragZoomSynchronizer.get('width').stop('widthQueue').animate({
                                width: widthZoomLevels[dragZoomSynchronizer.widthZoom - 1] * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'widthQueue'
                            }).dequeue('widthQueue');

                            var newScrollLeft = ((newWidth) * leftRatio + 200) + (e.clientX - innerContainer.offset().left - innerContainer.width() / 9) * ((widthZoomLevels[dragZoomSynchronizer.widthZoom - 1] - widthZoomLevels[dragZoomSynchronizer.widthZoom]) / widthZoomLevels[dragZoomSynchronizer.widthZoom]);

                            newScrollLeft = newScrollLeft < 200 ? 200 : newScrollLeft;
                            newScrollLeft = newScrollLeft > newWidth + 200 - innerContainer.width() ? newWidth + 200 - innerContainer.width() : newScrollLeft;

                            dragZoomSynchronizer.get('scrollLeft').stop('scrollLeftQueue', true).animate({
                                scrollLeft: newScrollLeft
                            }, {
                                duration: 350,
                                queue: 'scrollLeftQueue'
                            }).dequeue('scrollLeftQueue');
                        }

                        if (dragZoomSynchronizer.heightZoom > 0 && dragZoomSynchronizer.heightZoom < heightZoomLevels.length) {
                            var newHeight = targetElemFinalHeight * (heightZoomLevels[dragZoomSynchronizer.heightZoom - 1] / heightZoomLevels[dragZoomSynchronizer.heightZoom]);
                            dragZoomSynchronizer.get('height').stop('heightQueue').animate({
                                height: (heightZoomLevels[dragZoomSynchronizer.heightZoom - 1]) * 100 + "%"
                            }, {
                                duration: 350,
                                queue: 'heightQueue'
                            }).dequeue('heightQueue');

                            var newScrollTop = ((newHeight) * topRatio + 200) + (e.clientY - innerContainer.offset().top) * ((heightZoomLevels[dragZoomSynchronizer.heightZoom - 1] - heightZoomLevels[dragZoomSynchronizer.heightZoom]) / heightZoomLevels[dragZoomSynchronizer.heightZoom]);

                            newScrollTop = newScrollTop < 200 ? 200 : newScrollTop;
                            newScrollTop = newScrollTop > newHeight + 200 - innerContainer.height() ? newHeight + 200 - innerContainer.height() : newScrollTop;

                            dragZoomSynchronizer.get('scrollTop').stop('scrollTopQueue', true).animate({
                                scrollTop: newScrollTop
                            }, {
                                duration: 350,
                                queue: 'scrollTopQueue'
                            }).dequeue('scrollTopQueue');
                        }

                        if (dragZoomSynchronizer.widthZoom > 0) {
                            scope.$apply(function () {
                                dragZoomSynchronizer.widthZoom--;
                                dragZoomSynchronizer.heightZoom--;
                            });
                        }
                    }
                });

                // handles dragging

                // stores the mouse coordinates of the last drag call; used for calculating velocity
                var lastCoordinates = { x: 0, y: 0 };
                // stores how fast the element is currently being dragged
                var velocity = { x: 0, y: 0 };
                // stores the initial position of the mouse and the scroll bars when the dragging begins.
                var initialPosition = { clientX: 0, clientY: 0, scrollLeft: 0, scrollTop: 0 };

                dragZoomSynchronizer.get('scrollLeft').scrollLeft(200);
                dragZoomSynchronizer.get('scrollTop').scrollTop(200);
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

                    dragZoomSynchronizer.get('scrollTop').stop('scrollTopQueue', true).scrollTop(newTop);
                    dragZoomSynchronizer.get('scrollLeft').stop('scrollLeftQueue', true).scrollLeft(newLeft);
                }

                $(window).on('mouseup', function (e) {
                    $(window).off('mousemove', mouseMoveHandler);

                    var newTop = innerContainer.scrollTop() + velocity.y * 10;
                    newTop = newTop < 200 ? 200 : newTop;
                    newTop = newTop > targetElement[0].scrollHeight - innerContainer.height() - 200 ? targetElement[0].scrollHeight - innerContainer.height() - 200 : newTop;

                    var newLeft = innerContainer.scrollLeft() + velocity.x * 10;
                    newLeft = newLeft < 200 ? 200 : newLeft;
                    newLeft = newLeft > targetElement[0].scrollWidth - innerContainer.width() - 200 ? targetElement[0].scrollWidth - innerContainer.width() - 200 : newLeft;

                    dragZoomSynchronizer.get('scrollLeft').stop('scrollLeftQueue', true).animate({
                        scrollLeft: newLeft
                    }, {
                        duration: 800,
                        easing: 'easeOutQuart',
                        queue: 'scrollLeftQueue'
                    }).dequeue('scrollLeftQueue');
                    dragZoomSynchronizer.get('scrollTop').stop('scrollTopQueue', true).animate({
                        scrollTop: newTop
                    }, {
                        duration: 800,
                        easing: 'easeOutQuart',
                        queue: 'scrollTopQueue'
                    }).dequeue('scrollTopQueue');
                });

                targetElement.on('mousedown', function (e) {
                    dragZoomSynchronizer.get('scrollLeft').stop('scrollLeftQueue', true);
                    dragZoomSynchronizer.get('scrollTop').stop('scrollTopQueue', true);

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
