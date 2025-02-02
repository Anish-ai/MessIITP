export let BlurStyle = /*#__PURE__*/function (BlurStyle) {
  BlurStyle[BlurStyle["Normal"] = 0] = "Normal";
  BlurStyle[BlurStyle["Solid"] = 1] = "Solid";
  BlurStyle[BlurStyle["Outer"] = 2] = "Outer";
  BlurStyle[BlurStyle["Inner"] = 3] = "Inner";
  return BlurStyle;
}({}); //!< fuzzy inside, nothing outside
export const isMaskFilter = obj => obj !== null && obj.__typename__ === "MaskFilter";

/**
 * See SkMaskFilter.h for more details.
 */
//# sourceMappingURL=MaskFilter.js.map