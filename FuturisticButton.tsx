import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface FuturisticButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const FuturisticButton: React.FC<FuturisticButtonProps> = ({ onPress, children, style, textStyle, disabled }) => (
  <TouchableOpacity
    style={[styles.futuristicButton, style, disabled ? { opacity: 0.5 } : null]}
    onPress={onPress}
    disabled={disabled}
  >
    {typeof children === 'string' || typeof children === 'number' ? (
      <Text style={[styles.buttonText, textStyle]}>{children}</Text>
    ) : (
      children
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  futuristicButton: {
    backgroundColor: '#00C9A7',
    marginHorizontal: 6,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#232946',
  },
  buttonText: {
    color: '#232946',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});

export default FuturisticButton; 