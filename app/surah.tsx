import { View, FlatList, StatusBar, StyleSheet, Text, ViewToken, Pressable, Image, ImageBackground, useWindowDimensions } from "react-native";
import hafsData from "@/assets/data/hafs.json";
import warshData from "@/assets/data/warsh.json";
import chapterData from "@/assets/data/chapters/en.json";
import { useLocalSearchParams } from "expo-router";
import AyahBookmark from "@/components/AyahBookmark";
import { useEffect, useRef, useState } from "react";
import { Feather, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { interpolate } from "@/logic/interploate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type SuraNumber = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
  21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 |
  45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 |
  69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 |
  93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114}`;

export default function Surah() {
  const { number, ayah } = useLocalSearchParams<{
    number: SuraNumber;
    ayah: string;
  }>();

  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [riwaya, setRiwaya] = useState<'hafs' | 'warsh'>('hafs');

  const { width, height } = useWindowDimensions();

  const flatListRef = useRef<FlatList<string>>(null);

  const [currentBookmark, setCurrentBookmark] = useState(false);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
  }).current;

  const getRiwaya = async () => {
    try {
      const riwaya = await AsyncStorage.getItem("riwaya");
      if (riwaya === 'warsh') {
        setRiwaya('warsh');
      } else {
        setRiwaya('hafs');
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getRiwaya();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  useEffect(() => {
    if (!hasScrolled) {
      flatListRef.current?.scrollToIndex({
        index: Math.min(Number(ayah) ?? 1, hafsData[number].length - 1),
        animated: false,
      });
      setHasScrolled(true);
    }
  }, [ayah]);

  // Check if current verse is bookmarked
  const checkBookmark = async () => {
    try {
      const bookmarksStorage = await AsyncStorage.getItem("bookmarks");
      const bookmarks = JSON.parse(bookmarksStorage || '[]');
      
      const exists = bookmarks.some((bookmark: typeof hafsData[1][1]) => 
        bookmark.chapter === hafsData[number][currentIndex].chapter && 
        bookmark.verse === hafsData[number][currentIndex].verse
      );
      
      setCurrentBookmark(exists);
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleTafsir = async () => {
    // router.push("/tafsir")
  };

  const toggleBookmark = async () => {
    try {
      const bookmarksStorage = await AsyncStorage.getItem("bookmarks");
      const bookmarks = JSON.parse(bookmarksStorage || '[]');

      const newBookmarks = currentBookmark
        ? bookmarks.filter((bookmark: typeof hafsData[1][1]) => 
            !(bookmark.chapter === hafsData[number][currentIndex].chapter && 
              bookmark.verse === hafsData[number][currentIndex].verse)
          )
        : [...bookmarks, hafsData[number][currentIndex]];

      await AsyncStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
      setCurrentBookmark(!currentBookmark);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  useEffect(() => {
    checkBookmark();
  }, [currentIndex]);

  const padding = interpolate(width, 12, 24, 320, 1366);
  const fontSize = width >= 744 ? interpolate(width, 28, 40, 320, 1366) : interpolate(height, 20, 26, 667, 1024);

  const fontSizeSurah = interpolate(width, 24, 42, 320, 1366);
  const surahFrameWidth = interpolate(width, 160, 256, 320, 1366);
  const surahFrameHeight = interpolate(width, 50, 67, 320, 1366);

  const fontSizeAyah = interpolate(width, 18, 28, 320, 1366);
  const ayahFrameSize = interpolate(width, 36, 56, 320, 1366);

  const surah = riwaya === 'hafs' ? hafsData[number] : warshData[number];

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar
        hidden
      />
      <Pressable onPress={toggleBookmark} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, padding: 20 }}>
        <FontAwesome name={ currentBookmark ? "bookmark" : "bookmark-o"} size={ayahFrameSize - 6} color="#E5AE2D" />
      </Pressable>

      <Pressable onPress={toggleTafsir} style={{ position: "absolute", top: 0, right: 0, zIndex: 1, padding: 20 }}>
        <MaterialCommunityIcons name="text-box-search-outline" size={ayahFrameSize - 6} color="#E5AE2D" />
      </Pressable>

      {/* Bottom Center */}
      <View style={{ position: "absolute", bottom: 40, right: "10%", left: "10%", zIndex: 1, alignItems: "center" }}>
        <View style={[styles.surahNumberContainer, { width: ayahFrameSize, height: ayahFrameSize }]}>
          <Feather name="hexagon" size={ayahFrameSize} color="#E5AE2D" />
          <Text style={[styles.surahNumber, { fontSize: fontSizeAyah }]}>{hafsData[number][currentIndex].verse}</Text>
        </View>
      </View>

      {/* Top Center */}
      <SafeAreaView style={{ position: "absolute", top: 20, right: "10%", left: "10%", zIndex: 2, alignItems: "center" }}>
        <ImageBackground
          style={[styles.surahNameContainer, { width: surahFrameWidth, height: surahFrameHeight }]}
          source={require("@/assets/icons/frame-o.png")}
        >
          <Text style={{ color: "#fff", fontFamily: "hafs", fontSize: fontSizeSurah, marginBottom: 5 }}>
            سـورة {chapterData[Number(number) - 1].name}
          </Text>
        </ImageBackground>
      </SafeAreaView>

      { number && surah && <FlatList
        data={surah}
        keyExtractor={(item) => item.verse.toString()}
        renderItem={({ item: ayah }) => {
          const fontFamily = riwaya === 'hafs' ? 'hafs' : 'warsh';
          return (
            <View style={[styles.itemContainer, {
              height: height > width ? height : '100%',
              width: height > width ? '100%' : width,
            }]}>
              <AyahBookmark item={ayah} padding={padding} fontSize={fontSize} fontFamily={fontFamily} />
            </View>
          )
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: height > width ? height : width,
          offset: (height > width ? height : width) * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        initialScrollIndex={Math.min(Number(ayah), hafsData[number].length - 1)}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        // onEndReached={() => {
        //   router.goBack();
        // }}
        // onEndReachedThreshold={0.1}
      />}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
  },
  itemContainer: {
    backgroundColor: '#000',
    alignItems: 'center',
    textAlign: 'right',
  },
  surahNumber: {
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
  },
  surahNameContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
});
