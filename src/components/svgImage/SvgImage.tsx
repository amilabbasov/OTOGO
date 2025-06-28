import React from 'react';
import { Image, ImageProps } from 'react-native';

interface SvgImageProps extends Omit<ImageProps, 'source'> {
  source: any;
  width?: number;
  height?: number;
}

const SvgImage: React.FC<SvgImageProps> = ({ source, width, height, style, ...props }) => {
  return (
    <Image
      source={source}
      style={[{ width, height }, style]}
      resizeMode="contain"
      {...props}
    />
  );
};

export default SvgImage;