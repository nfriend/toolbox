// attache to appropriate angular module

.directive('dragZoom', function () {
    return {
        controller: 'DragZoomController',
        link: function (scope, elem, attr, ctrl) {

            // handles zooming
            elem.bind('mousewheel', function (e) {
                // base calculations on what the element's width *should* be, not what it is currently - the element
                // might be in the middle of another zooming animation
                var elemFinalWidth = elem.parent().width() * scope.zoomLevel;

                // where the mouse was (on the x-axis) in relation to the element.
                // this uses the REAL width of elem, because it's important that we zoom 
                // relative where the mouse is right now
                var ratio = (e.clientX - elem.offset().left) / elem.width();

                if (e.originalEvent.wheelDelta > 0) {
                    // if we zoomed in

                    // limit the zoom to level 5
                    if (scope.zoomLevel !== 5) {
                        var changeInWidth = elemFinalWidth * ((scope.zoomLevel + 1) / scope.zoomLevel) - elem.width();
                        elem.stop('zoomQueue').animate({
                            left: "+=" + (-1 * changeInWidth * ratio),
                            width: (scope.zoomLevel + 1) * 100 + "%"
                        }, {
                            duration: 350,
                            queue: 'zoomQueue'
                        }).dequeue('zoomQueue');

                        scope.$apply(function () {
                            scope.zoomLevel++;
                        });
                    }
                } else {
                    // if we zoomed out

                    // limit the zoom to level 1
                    if (scope.zoomLevel !== 1) {
                        var newWidth = elemFinalWidth * ((scope.zoomLevel - 1) / scope.zoomLevel);
                        var changeInWidth = elemFinalWidth - newWidth;
                        var newLeft = parseFloat(elem.css('left')) + (changeInWidth * ratio);

                        newLeft = newLeft > 0 ? 0 : newLeft;
                        newLeft = newLeft < -1 * newWidth + elem.parent().width() ? -1 * newWidth + elem.parent().width() : newLeft;

                        elem.stop('zoomQueue').animate({
                            left: newLeft + "px",
                            width: (scope.zoomLevel - 1) * 100 + "%"
                        }, {
                            duration: 350,
                            queue: 'zoomQueue'
                        }).dequeue('zoomQueue');

                        scope.$apply(function () {
                            scope.zoomLevel--;
                        });
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
                    elem.stop('draggableQueue');
                    velocity.x = e.clientX - lastCoordinates.x;
                    velocity.y = e.clientY - lastCoordinates.y;
                    lastCoordinates.x = e.clientX;
                    lastCoordinates.y = e.clientY;
                },
                stop: function (e) {
                    // calling elem.width() right now may not give use a good value to use, as the element might be being zoomed in/out
                    // instead, use the width that the element *will* have once all zomming in/out operations are complete
                    var elemWidth = elem.parent().width() * scope.zoomLevel;

                    // calculate the final points of the element, with inertia
                    var newLeft = parseFloat(elem.css('left')) + velocity.x * 20;
                    var newTop = parseFloat(elem.css('top')) + velocity.y * 20;

                    // ensure that the end position of the element is never beyond its parent's bounds
                    newLeft = newLeft < -1 * elemWidth + elem.parent().width() ? -1 * elemWidth + elem.parent().width() : newLeft;
                    newLeft = newLeft > 0 ? 0 : newLeft;
                    newTop = newTop < -1 * elem.height() + elem.parent().height() ? -1 * elem.height() + elem.parent().height() : newTop;
                    newTop = newTop > 0 ? 0 : newTop;

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
                    elem.stop('draggableQueue')
                        .animate({
                            left: newLeft,
                            top: newTop
                        }, {
                            duration: 800,
                            easing: 'easeOutQuart',
                            queue: 'draggableQueue'
                        }).dequeue('draggableQueue');
                }
            });

        }
    };
});

// use this controller: 
.controller('DragZoomController', ['$scope', function ($scope) {
    $scope.zoomLevel = 1;
}]);