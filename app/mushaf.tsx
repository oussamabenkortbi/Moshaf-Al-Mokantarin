import { ImageBackground, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Text, View, ThemedContainer } from "@/components/Themed";
import { interpolate } from "@/logic/interploate";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";

export default function MushafSelector() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const fontSizeSurah = interpolate(width, 24, 42, 320, 1366);
  const surahFrameWidth = interpolate(width, 256, 512, 320, 1366);
  const surahFrameHeight = interpolate(width, 67, 134, 320, 1366);

  const [selected, setSelected] = useState<'hafs' | 'warsh'>('hafs');

  const getRiwaya = async () => {
    try {
      const riwaya = await AsyncStorage.getItem("riwaya");
      if (riwaya === 'hafs' || riwaya === 'warsh') {
        setSelected(riwaya);
      } else {
        await AsyncStorage.setItem("riwaya", "hafs");
        setSelected('hafs');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWarsh = async () => {
    try {
      await AsyncStorage.setItem("riwaya", 'warsh');
      setSelected('warsh');
    } catch (error) {
      console.log(error);
    }
  };

  const handleHafs = async () => {
    try {
      await AsyncStorage.setItem("riwaya", 'hafs');
      setSelected('hafs');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRiwaya();
  }, []);
  
  const renderOption = (
    isSelected: boolean, 
    onPress: () => void, 
    title: string
  ) => (
    <ImageBackground
      key={title}
      style={[styles.optionContainer, { 
        width: surahFrameWidth, 
        height: surahFrameHeight, 
        marginVertical: 10 
      }]}
      source={isSelected ? require("@/assets/icons/frame.png") : require("@/assets/icons/frame-o.png")}
      resizeMode="cover"
    >
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.optionButton, 
          { 
            opacity: pressed ? 0.8 : 1,
          }
        ]}
      >
        <Text 
          style={[
            styles.optionText, 
            { 
              fontSize: fontSizeSurah,
              color: isSelected ? colors.card : colors.text
            }
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </ImageBackground>
  );
  
  return (
    <ThemedContainer style={styles.container}>
      {renderOption(
        selected === 'warsh', 
        handleWarsh, 
        'رواية ورش عن نافع'
      )}
      {renderOption(
        selected === 'hafs', 
        handleHafs, 
        'رواية حفص عن عاصم'
      )}
    </ThemedContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  optionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  optionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    margin: 4,
  },
  optionText: {
    fontFamily: 'hafs',
    textAlign: 'center',
  },
});
