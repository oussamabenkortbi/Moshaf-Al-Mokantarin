import { FlatList, ImageBackground, Pressable, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import quranData from "@/assets/data/chapters/en.json";
import { Text, View, ThemedContainer } from "@/components/Themed";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { toArabicWord } from "@/logic/towords";
import { interpolate } from "@/logic/interploate";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();

  const fontSizeSurah = interpolate(width, 24, 42, 320, 1366);
  const surahFrameWidth = interpolate(width, 160, 256, 320, 1366);
  const surahFrameHeight = interpolate(width, 50, 67, 320, 1366);
  const fontSizeAyah = interpolate(width, 18, 28, 320, 1366);
  const ayahFrameSize = interpolate(width, 36, 56, 320, 1366);

  return (
    <ThemedContainer style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />


      {/* Top Center - Quran Title */}
      <SafeAreaView style={{ position: "absolute", top: 40, right: "10%", left: "10%", zIndex: 1, alignItems: "center" }}>
        {/* top right icon */}
        <Link 
          href="/theme" 
          style={{ 
            position: "absolute", 
            top: 20, 
            right: 20, 
            zIndex: 2, 
            padding: 10,
            backgroundColor: colors.card,
            borderRadius: 20,
            elevation: 2,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <MaterialCommunityIcons 
            name={colors.isDark ? 'weather-sunny' : 'weather-night'} 
            size={24} 
            color={colors.primary} 
          />
        </Link>
        {/* top center title */}
        <ImageBackground
          style={[styles.surahNameContainer, { width: surahFrameWidth, height: surahFrameHeight }]}
          source={require("@/assets/icons/frame-o.png")}
        >
          <Link href="/mushaf" style={{ flex: 1, paddingTop: 2.5 }}>
            <Text style={{ 
              color: colors.text, 
              fontFamily: "hafs", 
              fontSize: fontSizeSurah,
              textAlign: 'center'
            }}>
              القرآن الكريم
            </Text>
          </Link>
        </ImageBackground>
        {/* top left icon */}
        <Link 
          href="/search" 
          style={{ 
            position: "absolute", 
            top: 20, 
            left: 20, 
            zIndex: 2, 
            padding: 10,
            backgroundColor: colors.card,
            borderRadius: 20,
            elevation: 2,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <MaterialCommunityIcons 
            name="magnify" 
            size={24} 
            color={colors.primary} 
          />
        </Link>
        { /* top center icon for bookmarks */}
        <Link 
          href="/bookmarks" 
          style={{ 
            position: "absolute", 
            top: 20, 
            left: "50%", 
            transform: [{ translateX: -20 }],
            zIndex: 2, 
            padding: 10,
            backgroundColor: colors.card,
            borderRadius: 20,
            elevation: 2,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <MaterialCommunityIcons 
            name="bookmark" 
            size={24} 
            color={colors.primary} 
          />
        </Link>
      </SafeAreaView>
      
      <View style={{ height: 140 }} />

      <FlatList
        style={{ width: '100%', backgroundColor: colors.background }}
        data={quranData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Pressable 
            style={[styles.surahItem, { borderBottomColor: colors.border, backgroundColor: colors.background }]} 
            onPress={() => router.push(`/surah?number=${item.id}&ayah=0`)}
          >
            <View style={{ 
              flex: 1, 
              flexDirection: 'row-reverse', 
              alignItems: 'center', 
            }}>
              <View style={[styles.surahNumberContainer, { backgroundColor: 'transparent' }]}>
                <Feather name="hexagon" size={36} color={colors.primary} />
                <Text style={[styles.surahNumber, { color: colors.text }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.surahName, { color: colors.text }]}>
                سورة {item.name}
              </Text>
            </View>
            <Text style={[styles.surahIndex, { color: colors.secondary }]}>
              {item.type === "meccan" ? "مكية" : "مدنية"} وآياتها {toArabicWord(item.total_verses)}
            </Text>
          </Pressable>
        )}
      />
    </ThemedContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  surahNameContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  surahItem: { 
    padding: 16,
    borderBottomWidth: 1,
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
