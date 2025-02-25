import { ImageBackground, Pressable, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import { interpolate } from "@/logic/interploate";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Search() {

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
  }

  const handleWarsh = async () => {
    try {
      await AsyncStorage.getItem("riwaya");
      await AsyncStorage.setItem("riwaya", 'warsh');
      setSelected('warsh');
    } catch (error) {
      console.log(error);
    }
  }

  const handleHafs = async () => {
    try {
      await AsyncStorage.getItem("riwaya");
      await AsyncStorage.setItem("riwaya", 'hafs');
      setSelected('hafs');
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getRiwaya();
  }, []);
  
  return (
    <View style={styles.container}>
      <StatusBar
        hidden
      />
      
      <ImageBackground
        style={[styles.surahNameContainer, { width: surahFrameWidth, height: surahFrameHeight, marginVertical: 10 }]}
        source={selected === 'warsh' ? require("@/assets/icons/frame.png") : require("@/assets/icons/frame-o.png")}
      >
        <Pressable onPress={handleWarsh} style={{ flex: 1, justifyContent: 'center', paddingBottom: 10 }}>
          <Text style={{ color: selected === 'warsh' ? "#000" : "#fff", fontFamily: "hafs", fontSize: fontSizeSurah }}>
            رواية ورش عن نافع
          </Text>
        </Pressable>
      </ImageBackground>
      <ImageBackground
        style={[styles.surahNameContainer, { width: surahFrameWidth, height: surahFrameHeight, marginVertical: 10 }]}
        source={selected === 'hafs' ? require("@/assets/icons/frame.png") : require("@/assets/icons/frame-o.png")}
      >
        <Pressable onPress={handleHafs} style={{ flex: 1, justifyContent: 'center', paddingBottom: 10 }}>
          <Text style={{ color: selected === 'hafs' ? "#000" : "#fff", fontFamily: "hafs", fontSize: fontSizeSurah }}>
            رواية حفص عن عاصم
          </Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#000'
  },
  surahNameContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  surahItem: { 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: '100%',
    backgroundColor: '#000'
  },
  surahName: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#fff'
  },
  surahNumber: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#fff',
    position: "absolute",
  },
  surahNumberContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    marginLeft: 10,
    backgroundColor: '#000'
  },
  surahIndex: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#E5AE2D'
  },
});
