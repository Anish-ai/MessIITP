"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panTransformGesture = exports.pinchTransformGesture = void 0;
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const react_native_skia_1 = require("@shopify/react-native-skia");
const pinchTransformGesture = (state, _config = {}) => {
    const defaults = {
        enabled: true,
        dimensions: ["x", "y"],
    };
    const config = Object.assign(Object.assign({}, defaults), _config);
    const dimensions = Array.isArray(config.dimensions)
        ? config.dimensions
        : [config.dimensions];
    const scaleX = dimensions.includes("x");
    const scaleY = dimensions.includes("y");
    const pinch = react_native_gesture_handler_1.Gesture.Pinch()
        .onBegin((e) => {
        state.offset.value = state.matrix.value;
        state.origin.value = {
            x: e.focalX,
            y: e.focalY,
        };
    })
        .onStart(() => {
        state.zoomActive.value = true;
    })
        .onChange((e) => {
        state.matrix.value = (0, react_native_skia_1.multiply4)(state.offset.value, (0, react_native_skia_1.scale)(scaleX ? e.scale : 1, scaleY ? e.scale : 1, 1, state.origin.value));
    })
        .onEnd(() => {
        state.zoomActive.value = false;
    });
    return pinch;
};
exports.pinchTransformGesture = pinchTransformGesture;
const panTransformGesture = (state, _config = {}) => {
    const defaults = {
        enabled: true,
        dimensions: ["x", "y"],
    };
    const config = Object.assign(Object.assign({}, defaults), _config);
    const dimensions = Array.isArray(config.dimensions)
        ? config.dimensions
        : [config.dimensions];
    const panX = dimensions.includes("x");
    const panY = dimensions.includes("y");
    const pan = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        state.panActive.value = true;
    })
        .onChange((e) => {
        state.matrix.value = (0, react_native_skia_1.multiply4)((0, react_native_skia_1.translate)(panX ? e.changeX : 0, panY ? e.changeY : 0, 0), state.matrix.value);
    })
        .onEnd(() => {
        state.panActive.value = false;
    });
    if (config.activateAfterLongPress !== undefined) {
        pan.activateAfterLongPress(config.activateAfterLongPress);
    }
    return pan;
};
exports.panTransformGesture = panTransformGesture;
