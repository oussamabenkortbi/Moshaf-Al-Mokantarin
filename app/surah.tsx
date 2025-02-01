import { Dimensions, FlatList, StatusBar, StyleSheet } from "react-native";
import quranData from "@/assets/data/quran.json";
import { View } from "@/components/Themed";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AyahBookmark from "@/components/AyahBookmark";
import { useEffect, useRef, useState } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const router = useNavigation();
  const flatListRef = useRef<FlatList<string>>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!hasScrolled) {
      flatListRef.current?.scrollToIndex({
        index: Math.min(Number(ayah) ?? 1, quranData[number].length - 1),
        animated: false,
      });
      setHasScrolled(true);
    }
  }, [ayah]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
    <StatusBar
      hidden
    />
      { number && <FlatList
        data={quranData[number]}
        keyExtractor={(item) => item.verse.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <AyahBookmark item={item} />
          </View>
        )}
        getItemLayout={(data, index) => ({
          length: Dimensions.get("window").height || 800, // Fallback height
          offset: (Dimensions.get("window").height || 800) * index,
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
        initialScrollIndex={Math.min(Number(ayah), quranData[number].length - 1)}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          router.goBack();
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 100, // Adjust as needed
        }}
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
    height: SCREEN_HEIGHT,
    width: '100%',
    alignItems: 'center',
    textAlign: 'right',
  },
});
