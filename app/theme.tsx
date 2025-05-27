import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Pressable, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/Themed';
import { interpolate } from '@/logic/interploate';
import { useWindowDimensions } from 'react-native';

export default function ThemeScreen() {

  const { width } = useWindowDimensions();
  const { theme, toggleTheme, colors, setTheme } = useTheme();

  const fontSize = interpolate(width, 18, 24, 320, 1366);
  const frameWidth = interpolate(width, 200, 400, 320, 1366);
  const frameHeight = interpolate(width, 50, 80, 320, 1366);
  const isLightSelected = theme === 'light';
  const lightFrameSource = isLightSelected 
    ? require('@/assets/icons/frame.png') 
    : require('@/assets/icons/frame-o.png');
  
  const darkFrameSource = !isLightSelected 
    ? require('@/assets/icons/frame.png')
    : require('@/assets/icons/frame-o.png');
    
  const lightTextColor = isLightSelected ? '#000' : colors.text;
  const darkTextColor = !isLightSelected ? '#000' : colors.text;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <ImageBackground
        key={'light'}
        style={[styles.themeOption, { 
          width: frameWidth, 
          height: frameHeight,
          marginVertical: 10 
        }]}
        source={lightFrameSource}
        resizeMode="cover"
      >
        <Pressable 
          onPress={() => setTheme('light')}
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingBottom: 10 
          }}
        >
          <Text 
            style={{ 
              color: lightTextColor, 
              fontFamily: 'hafs', 
              fontSize: fontSize,
              textAlign: 'center'
            }}
          >
            {'الوضع الفاتح'}
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        key={'dark'}
        style={[styles.themeOption, { 
          width: frameWidth, 
          height: frameHeight,
          marginVertical: 10 
        }]}
        source={darkFrameSource}
        resizeMode="cover"
      >
        <Pressable 
          onPress={() => setTheme('dark')}
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingBottom: 10 
          }}
        >
          <Text 
            style={{ 
              color: darkTextColor, 
              fontFamily: 'hafs', 
              fontSize: fontSize,
              textAlign: 'center'
            }}
          >
            {'الوضع المظلم'}
          </Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  themeOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
