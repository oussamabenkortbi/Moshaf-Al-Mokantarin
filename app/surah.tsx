type SuraNumber = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
  21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 |
  45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 |
  69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 |
  93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114}`;

import { FlatList, StyleSheet, Text, ViewToken, Pressable, ImageBackground, useWindowDimensions, View, Vibration } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Feather, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-community/voice';

import hafsData from "@/assets/data/hafs.json";
import warshData from "@/assets/data/warsh.json";
import chapterData from "@/assets/data/chapters/en.json";
import AyahBookmark from "@/components/AyahBookmark";
import { interpolate } from "@/logic/interploate";
import { Text as ThemedText, View as ThemedView, ThemedContainer } from "@/components/Themed";
import { useTheme } from "@/contexts/ThemeContext";
import { matchVerse } from '@/logic/isMatch';

export default function Surah() {
  const { number, ayah } = useLocalSearchParams<{
    number: SuraNumber;
    ayah: string;
  }>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [riwaya, setRiwaya] = useState<'hafs' | 'warsh'>('hafs');
  const [currentBookmark, setCurrentBookmark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [verificationText, setVerificationText] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [verseProgress, setVerseProgress] = useState(0);

  const flatListRef = useRef<FlatList<string>>(null);
  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMounted = useRef(true);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
  }).current;

  const { width, height } = useWindowDimensions();
  
  const surah = riwaya === 'hafs' ? hafsData[number] : warshData[number];
  const padding = interpolate(width, 12, 24, 320, 1366);
  const fontSize = width >= 744 ? interpolate(width, 28, 40, 320, 1366) : interpolate(height, 20, 26, 667, 1024);
  const fontSizeSurah = interpolate(width, 24, 42, 320, 1366);
  const surahFrameWidth = interpolate(width, 160, 256, 320, 1366);
  const surahFrameHeight = interpolate(width, 50, 67, 320, 1366);
  const fontSizeAyah = interpolate(width, 18, 28, 320, 1366);
  const ayahFrameSize = interpolate(width, 36, 56, 320, 1366);
  const { colors } = useTheme();

  const getRiwaya = async () => {
    try {
      const riwaya = await AsyncStorage.getItem("riwaya");
      setRiwaya(riwaya === 'warsh' ? 'warsh' : 'hafs');
    } catch (error) {
      console.error("Error getting riwaya:", error);
    }
  }

  useEffect(() => {
    getRiwaya();
  }, []);

  useEffect(() => {
    console.log(debugInfo);
  }, [debugInfo]);

  const startVoiceRecognition = async () => {
    try {
      await Voice.start('ar-SA', {
        EXTRA_PARTIAL_RESULTS: true,
        EXTRA_MAX_RESULTS: 1,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1000,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
      });
      
      setIsListening(true);
      setSpokenText('');
      setVerificationText('');
      setDebugInfo('Listening...');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      // Try to restart on error
      if (isMounted.current) {
        setTimeout(startVoiceRecognition, 1000);
      }
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      setDebugInfo('Stopped listening');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && isMounted.current) {
      const newIndex = viewableItems[0].index || 0;
      setCurrentIndex(newIndex);
      console.log('Viewable item changed:', newIndex);
    }
  }).current;
  
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

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    
    return () => {
      isMounted.current = false;
      Voice.destroy().then(Voice.removeAllListeners);
      if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const startListening = async () => {
    if (!isMounted.current) return;
    
    try {
      setIsListening(true);
      setSpokenText('');
      await Voice.start('ar-SA');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
    }
  };

  const getCurrentVerseText = (verseIndex: number) => {
    // Find the verse where verse.verse === verseIndex + 1 (since verses are 1-based)
    const verse = hafsData[number]?.find(v => v.verse === verseIndex + 1);
    if (!verse) {
      console.warn('No verse found for index:', verseIndex, 'in surah', number);
      return '';
    }
    console.log('Current verse:', verse);
    return verse.text;
  };
  
  const moveToNextVerse = () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= hafsData[number].length) return;
    
    setVerificationText('✅ Correct!');
    
    Vibration.vibrate([50, 100, 50]);
    
    setSpokenText('');
    setCurrentIndex(nextIndex);
    setVerseProgress(0);
    
    try {
      console.log('Scrolling to verse:', nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5,
      });
    } catch (error) {
      console.error('Error scrolling:', error);
    }
  };

  const onSpeechResults = (event: { value?: string[] }) => {
    const text = event.value?.[0];
    if (!text || !isMounted.current) return;

    setSpokenText(text);
    processSpokenText(text);
  };
  
  const processSpokenText = (text: string) => {
    if (!text || text.length < 3) return;
    
    // Get the current verse text using currentIndex
    const currentVerseText = getCurrentVerseText(currentIndex);
    if (!currentVerseText) return;
    
    const result = matchVerse(text, currentVerseText);
    
    setVerseProgress(result.percentage);
    setDebugInfo(`Verse ${currentIndex + 1}/${surah.length}: ${result.debug}`);
    
    console.log(`Checking verse ${currentIndex + 1}:`, text);
    console.log(`Against verse ${currentIndex + 1} text:`, currentVerseText);
    console.log('Match result:', result);
    
    if (result.isMatch) {
      console.log(`Match found for verse ${currentIndex + 1}, moving to next verse`);
      moveToNextVerse();
    }
  };

  const handleStartListening = async () => {
    try {
      setVerseProgress(0);
      setSpokenText('');
      setDebugInfo('');
      setVerificationText(`Start reciting verse ${hafsData[number][currentIndex].verse}`);
      
      await startListening();
      
      setTimeout(() => {
        if (isMounted.current && isListening) {
          setVerificationText('');
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting listening:', error);
      setVerificationText('Error starting microphone');
    }
  };

  return (
    <ThemedContainer style={styles.container}>
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
      <Pressable
        onPress={isListening ? stopVoiceRecognition : handleStartListening}
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
        <ThemedView style={[styles.feedbackContainer, { padding }]}> 
          {isListening && (
            <View style={{ width: '100%', marginBottom: 10 }}>
              <View style={{
                height: 6,
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <View style={{
                  width: `${verseProgress}%`,
                  height: '100%',
                  backgroundColor: colors.primary,
                  borderRadius: 3
                }} />
              </View>
            </View>
          )}
          {verificationText ? (
            <ThemedText style={[styles.verificationText, {
              color: verificationText.startsWith('✅') ? '#4CAF50' : 
                     verificationText.startsWith('❌') ? '#F44336' : colors.text,
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: 'bold'
            }]}> 
              {verificationText}
            </ThemedText>
          ) : null}
          {debugInfo && isListening ? (
            <ThemedView style={{
              marginTop: 5,
              marginBottom: 5,
              padding: 8,
              borderRadius: 5,
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}>
              <ThemedText style={{
                fontSize: 12,
                color: colors.text,
                textAlign: 'center',
                fontFamily: 'System'
              }}>
                {debugInfo}
              </ThemedText>
            </ThemedView>
          ) : null}
          {spokenText ? (
            <ThemedText style={[styles.arabicText, {
              fontFamily: riwaya === 'hafs' ? 'hafs' : 'warsh',
              color: colors.text,
              opacity: 0.7,
              marginTop: 5
            }]}> 
              {spokenText}
            </ThemedText>
          ) : null}
        </ThemedView>
      </SafeAreaView>
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
    </ThemedContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  ayahContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  currentAyah: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  ayahNumberContainer: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  arabicText: {
    fontSize: 24,
    textAlign: 'right',
    fontFamily: 'UthmanicHafs',
    lineHeight: 40,
    writingDirection: 'rtl',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  micButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#007AFF',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  verificationContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  verificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  feedbackContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
