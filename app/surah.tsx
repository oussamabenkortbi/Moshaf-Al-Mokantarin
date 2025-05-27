import { FlatList, StyleSheet, Text, ViewToken, Pressable, ImageBackground, useWindowDimensions } from "react-native";
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
import { Text as ThemedText, View as ThemedView, ThemedContainer } from "@/components/Themed";
import { useTheme } from "@/contexts/ThemeContext";
import Voice from '@react-native-community/voice';
import Fuse from 'fuse.js';
import { normalizeText } from "@/logic/normalizeText";

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
    const initialize = async () => {
      await getRiwaya();

      if (!hasScrolled) {
        flatListRef.current?.scrollToIndex({
          index: Math.min(Number(ayah) ?? 1, hafsData[number].length - 1),
          animated: false,
        });
        setHasScrolled(true);
      }

      checkBookmark();
    };

    initialize();
  }, [ayah, currentIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

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

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('ar-SA');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
      setSpokenText('');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  let silenceTimeout: ReturnType<typeof setTimeout>;

  const onSpeechResults = (event: { value?: string[] }) => {
    const spokenText = event.value?.[0];
    if (!spokenText || spokenText.length < 10) return; // Ensure spoken text is at least 10 characters
    const normalizedSpokenText = normalizeText(spokenText);
    setSpokenText(spokenText);

    clearTimeout(silenceTimeout); // Clear any existing timeout

    silenceTimeout = setTimeout(() => {
      const verses = hafsData[number]?.map((verse) => {
        const normalizedVerseText = normalizeText(verse.text); // Normalize verse text
        return {
          text: normalizedVerseText,
          verse: verse.verse,
        };
      }) || [];

      const fuse = new Fuse(verses, { keys: ['text'], threshold: 0.6 }); // Configure Fuse.js for fuzzy matching
      const result = fuse.search(normalizedSpokenText);

      if (result.length > 0) {
        const matchedVerse = result[0].item;
        console.log('Matched Verse:', matchedVerse); // Log the matched verse
        flatListRef.current?.scrollToIndex({
          index: matchedVerse.verse - 1,
          animated: true,
        });
      } else {
        console.warn('No matching verse found');
      }

      stopListening(); // Stop listening after processing
    }, 1000); // Wait for 1 second of silence
  };

  const { colors } = useTheme();

  return (
    <ThemedContainer style={styles.container}>
      {/* Bottom Center - Current Ayah Number */}
      <ThemedView style={{ 
        position: "absolute", 
        bottom: 40, 
        right: "10%", 
        left: "10%", 
        zIndex: 1, 
        alignItems: "center" 
      }}>
        <ThemedView style={[styles.surahNumberContainer, { 
          width: ayahFrameSize, 
          height: ayahFrameSize 
        }]}>
          <Feather 
            name="hexagon" 
            size={ayahFrameSize} 
            color={colors.primary} 
          />
          <ThemedText 
            style={[styles.surahNumber, { 
              fontSize: fontSizeAyah,
              color: colors.text
            }]}
          >
            {hafsData[number][currentIndex].verse}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Bottom Left - Bookmark Button */}
      <Pressable 
        onPress={toggleBookmark} 
        style={{ 
          position: "absolute", 
          bottom: 20, 
          left: 20, 
          zIndex: 10,
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 8,
          elevation: 2,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
        }}
      >
        <FontAwesome
          name={currentBookmark ? "bookmark" : "bookmark-o"}
          size={ayahFrameSize - 6}
          color={colors.primary}
        />
      </Pressable>

      {/* Top Center - Surah Title */}
      <SafeAreaView style={{ 
        position: "absolute", 
        top: 20, 
        right: "10%", 
        left: "10%", 
        zIndex: 2, 
        alignItems: "center" 
      }}>
        <ImageBackground
          style={[styles.surahNameContainer, { 
            width: surahFrameWidth, 
            height: surahFrameHeight 
          }]}
          source={require("@/assets/icons/frame-o.png")}
          resizeMode="cover"
        >
          <ThemedText style={{ 
            fontFamily: "hafs", 
            fontSize: fontSizeSurah, 
            marginBottom: 5,
            textAlign: 'center',
            color: colors.text
          }}>
            سـورة {chapterData[Number(number) - 1].name}
          </ThemedText>
        </ImageBackground>
        
        {/* Spoken Text Display */}
        {spokenText && (
          <ThemedView style={[styles.textContainer, { padding }]}>
            <ThemedText style={[styles.arabicText, {
              fontSize,
              fontFamily: riwaya === 'hafs' ? 'hafs' : 'warsh',
              color: colors.text,
            }]}>
              {spokenText}
            </ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>

      {/* Ayah List */}
      {number && surah && (
        <FlatList
          data={surah}
          ref={flatListRef}
          keyExtractor={(item) => item.verse.toString()}
          renderItem={({ item: ayah }) => {
            const fontFamily = riwaya === 'hafs' ? 'hafs' : 'warsh';
            return (
              <ThemedView style={[styles.itemContainer, {
                height: height > width ? height : '100%',
                width: height > width ? '100%' : width,
                backgroundColor: colors.background,
              }]}>
                <AyahBookmark 
                  item={ayah} 
                  padding={padding} 
                  fontSize={fontSize} 
                  fontFamily={fontFamily} 
                  textColor={colors.text}
                />
              </ThemedView>
            );
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
        />
      )}

      {/* Voice Recognition Button */}
      <Pressable
        onPress={isListening ? stopListening : startListening}
        style={({ pressed }) => ({
          position: 'absolute', 
          bottom: 20, 
          right: 20, 
          zIndex: 10,
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 8,
          elevation: 2,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <MaterialCommunityIcons
          name={isListening ? 'pause-circle' : 'microphone'}
          size={36}
          color={colors.primary}
        />
      </Pressable>
    </ThemedContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  itemContainer: {
    alignItems: 'center',
    textAlign: 'right',
  },
  textContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  arabicText: {
    fontSize: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 40,
  },
  surahNumber: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'hafs',
    position: 'absolute',
  },
  surahNumberContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
