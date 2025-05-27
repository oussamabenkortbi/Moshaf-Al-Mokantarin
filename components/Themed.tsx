import { Text as DefaultText, View as DefaultView, TextProps as DefaultTextProps, ViewProps as DefaultViewProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultTextProps & {
  style?: StyleProp<TextStyle>;
};

export type ViewProps = ThemeProps & DefaultViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function Text({ style, lightColor, darkColor, ...props }: TextProps) {
  const { colors } = useTheme();
  const color = darkColor && lightColor 
    ? colors.isDark ? darkColor : lightColor 
    : colors.text;

  return <DefaultText style={[{ color, textAlign: 'right' }, style]} {...props} />;
}

export function View({ style, lightColor, darkColor, ...props }: ViewProps) {
  const { colors } = useTheme();
  const backgroundColor = darkColor && lightColor 
    ? colors.isDark ? darkColor : lightColor 
    : colors.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...props} />;
}

export function ThemedContainer({ children, style, ...props }: ViewProps) {
  const { colors } = useTheme();
  
  return (
    <View 
      style={[
        { 
          flex: 1, 
          backgroundColor: colors.background 
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}
