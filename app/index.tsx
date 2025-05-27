import { FlatList, ImageBackground, Pressable, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import quranData from "@/assets/data/chapters/en.json";
import { Text, View } from "@/components/Themed";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { toArabicWord } from "@/logic/towords";
import { interpolate } from "@/logic/interploate";

export default function Home() {

  const { width, height } = useWindowDimensions();

  const fontSizeSurah = interpolate(width, 24, 42, 320, 1366);
    const surahFrameWidth = interpolate(width, 160, 256, 320, 1366);
    const surahFrameHeight = interpolate(width, 50, 67, 320, 1366);
  
  const fontSizeAyah = interpolate(width, 18, 28, 320, 1366);
  const ayahFrameSize = interpolate(width, 36, 56, 320, 1366);

  // return (
  //   <View style={{ flex: 1, backgroundColor: '#000' }}>
      
  //   </View>
  // )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        hidden
      />

      {/* <Link href="/bookmarks" style={{ position: "absolute", top: 0, left: 0, zIndex: 1, padding: 20 }}>
        <FontAwesome name="bookmark-o" size={ayahFrameSize - 6} color="#E5AE2D" />
      </Link> */}

      {/* <Link href="/search" style={{ position: "absolute", top: 0, right: 0, zIndex: 1, padding: 20 }}>
        <MaterialCommunityIcons name="text-box-search-outline" size={ayahFrameSize - 6} color="#E5AE2D" />
      </Link> */}

      {/* Top Center */}
      <SafeAreaView style={{ position: "absolute", top: 20, right: "10%", left: "10%", zIndex: 2, alignItems: "center" }}>
        <ImageBackground
          style={[styles.surahNameContainer, { width: surahFrameWidth, height: surahFrameHeight }]}
          source={require("@/assets/icons/frame-o.png")}
        >
          <Link href="/mushaf" style={{ flex: 1, paddingTop: 2.5 }}>
            <Text style={{ color: "#fff", fontFamily: "hafs", fontSize: fontSizeSurah }}>
              القرآن الكريم
            </Text>
          </Link>
        </ImageBackground>
      </SafeAreaView>
      <View style={{ height: 80 }}></View>

      {/* <Link
        href="/surah?number=2&ayah=282"
        style={styles.surahItem}
      >
        <Text style={styles.surahName}>
          Test
        </Text>
      </Link> */}
      <FlatList
        style={{ width: '100%' }}
        data={quranData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Pressable style={styles.surahItem} onPress={() => router.push(`/surah?number=${item.id}&ayah=0`)}>
            <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#000' }}>
              <View style={styles.surahNumberContainer}>
                <Feather name="hexagon" size={36} color="#E5AE2D" />
                <Text style={styles.surahNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.surahName}>سورة {item.name}</Text>
            </View>
            <Text style={styles.surahIndex}>{item.type === "meccan" ? "مكية" : "مدنية"} وآياتها {toArabicWord(item.total_verses)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
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
