"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImageFilter = exports.TileMode = void 0;
let TileMode = exports.TileMode = /*#__PURE__*/function (TileMode) {
  TileMode[TileMode["Clamp"] = 0] = "Clamp";
  TileMode[TileMode["Repeat"] = 1] = "Repeat";
  TileMode[TileMode["Mirror"] = 2] = "Mirror";
  TileMode[TileMode["Decal"] = 3] = "Decal";
  return TileMode;
}({});
const isImageFilter = obj => obj !== null && obj.__typename__ === "ImageFilter";
exports.isImageFilter = isImageFilter;
//# sourceMappingURL=ImageFilter.js.map