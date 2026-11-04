# IronForm muscle atlas

Muscle paths are adapted from [react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter) by ELABBASSI Hicham (MIT, 2022). The complete license is in LICENSE.txt and embedded in each standalone SVG.

## Browser API

Load `anatomy.js` before the application script. No dependencies or network requests are required.

```js
IronAnatomy.render("chest", {view:"front", className:"target-body"})
IronAnatomy.render("back", {view:"back"})
IronAnatomy.render("abs", {crop:true})
```

`focus`: full, abs, chest, arms, legs, butt, back. Unknown focus returns a neutral diagram. `view` defaults to back for butt/back and front for the other groups. The optional `crop:true` produces a focused region for a category tile. Set `.muscle-atlas {width:100%;height:100%;display:block}` in the consuming UI.

Primary muscles are coral red. Secondary contributors are dark red; unselected parts remain graphite. Front/back diagrams are present for each focus. The `*-detail.svg` files crop the target region, while `full-pair.svg` shows the complete front/back pair.

These maps communicate general training focus. They do not represent measured fatigue, recovery percentages, diagnosis or exact exercise activation.
