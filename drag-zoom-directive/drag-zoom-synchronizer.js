'use strict';

angular.module('yourModuleNameHere')
    .factory('dragZoomSynchronizer', function () {
        var dragZoomSynchronizerInstance = {
            zoom: 1
        }

        var elementsToSync = {
            left: null,
            top: null,
            width: null,
            height: null
        }

        // for optimization purposes
        var allElementsIsDirty = true;
        var allElements = $();

        dragZoomSynchronizerInstance.add = function (propertyToSync, $elementToSync) {
            allElementsIsDirty = true;
            if (elementsToSync[propertyToSync]) {
                elementsToSync[propertyToSync] = elementsToSync[propertyToSync].add($elementToSync);
            } else {
                elementsToSync[propertyToSync] = $elementToSync;
            }
            return dragZoomSynchronizerInstance;
        }

        dragZoomSynchronizerInstance.get = function (propertyToSync) {
            if (propertyToSync == 'all') {

                // don't regenerate this list if we haven't added anything since the 
                // last time this method was called
                if (!allElementsIsDirty) {
                    return allElements;
                }

                allElements = $();
                for (var property in elementsToSync) {
                    if (elementsToSync.hasOwnProperty(property)) {
                        if (elementsToSync[property] !== null) {
                            allElements = allElements.add(elementsToSync[property]);
                        }
                    }
                }
                allElementsIsDirty = false;
                return allElements;
            } else {
                return elementsToSync[propertyToSync];
            }
        }

        return dragZoomSynchronizerInstance;
    });