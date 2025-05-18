import React from "react";
import Svg, { Rect } from "react-native-svg";

const QRCode = () => {
  return (
    <Svg width={150} height={150} viewBox="0 0 100 100">
      {/* QR Code pattern */}
      <Rect x="10" y="10" width="30" height="30" fill="black" />
      <Rect x="15" y="15" width="20" height="20" fill="white" />
      <Rect x="20" y="20" width="10" height="10" fill="black" />

      <Rect x="60" y="10" width="30" height="30" fill="black" />
      <Rect x="65" y="15" width="20" height="20" fill="white" />
      <Rect x="70" y="20" width="10" height="10" fill="black" />

      <Rect x="10" y="60" width="30" height="30" fill="black" />
      <Rect x="15" y="65" width="20" height="20" fill="white" />
      <Rect x="20" y="70" width="10" height="10" fill="black" />

      <Rect x="45" y="45" width="10" height="10" fill="black" />
      <Rect x="55" y="55" width="10" height="10" fill="black" />
      <Rect x="65" y="65" width="10" height="10" fill="black" />
      <Rect x="45" y="65" width="10" height="10" fill="black" />
      <Rect x="55" y="75" width="10" height="10" fill="black" />
      <Rect x="45" y="85" width="10" height="10" fill="black" />
      <Rect x="75" y="45" width="10" height="10" fill="black" />
      <Rect x="85" y="55" width="10" height="10" fill="black" />
    </Svg>
  );
};

export default QRCode;
