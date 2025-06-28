import React from 'react';
import {Insets, Pressable, StyleProp, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

export interface SvgImageProps extends SvgProps {
  source: any;
  isPressable?: boolean;
  onPress?: () => void;
  pressableStyle?: StyleProp<ViewStyle>;
  pressableHitSlop?: null | Insets | number | undefined;
}

export const SvgImage: React.FC<SvgImageProps> = ({
  source,
  children,
  isPressable,
  pressableHitSlop,
  pressableStyle,
  onPress,
  ...props
}) => {
  if (!source?.default) {
    return null;
  }

  if (props.width) {
    props.width = Number(props.width);
  }

  if (props.height) {
    props.height = Number(props.height);
  }

  if (isPressable) {
    return (
      <Pressable
        hitSlop={pressableHitSlop}
        onPress={onPress}
        style={pressableStyle}>
        {React.createElement(source.default, props, children)}
      </Pressable>
    );
  }

  return React.createElement(source.default, props, children);
};
