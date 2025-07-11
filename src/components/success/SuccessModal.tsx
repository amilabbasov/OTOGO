import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { SvgImage } from '../svgImage/SvgImage';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  onHide: () => void;
  svgSource: any;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, message, subMessage, onHide, svgSource }) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(onHide, 1500);
      return () => clearTimeout(timer);
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onHide}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.box, { transform: [{ scale }], opacity }]}>
            <SvgImage
              source={svgSource}
              width={144}
              height={124}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.text}>{message}</Text>
            {subMessage ? (
              <Text style={styles.subText}>{subMessage}</Text>
            ) : null}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14151A',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#14151A',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default SuccessModal; 