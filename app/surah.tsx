import { FlatList, StyleSheet, Text, ViewToken, Pressable, ImageBackground, useWindowDimensions, View, TouchableOpacity, Animated, Easing } from 'react-native';
import hafsData from "@/assets/data/hafs.json";
import warshData from "@/assets/data/warsh.json";
import chapterData from "@/assets/data/chapters/en.json";
import { useLocalSearchParams } from 'expo-router';
import AyahBookmark from "@/components/AyahBookmark";
import { useRef, useState, useEffect } from 'react';
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { interpolate } from "@/logic/interploate";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text as ThemedText, View as ThemedView, ThemedContainer } from "@/components/Themed";
import { useTheme } from "@/contexts/ThemeContext";
import Voice from '@react-native-community/voice';
import { normalizeText } from "@/logic/normalizeText";
import { isVerificationMatch } from '@/logic/isMatch';

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

  // Refs for cleanup
  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const waveAnimations = useRef<Animated.CompositeAnimation[]>([]);
  
  // Animation values
  const animationValue = useRef(new Animated.Value(0)).current;
  const waveAnimationValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationText, setVerificationText] = useState('');
  const [isReadingCurrentVerse, setIsReadingCurrentVerse] = useState(true);
  const isMounted = useRef(true);

  // Initialize animations
  useEffect(() => {
    if (isListening) {
      // Main button pulse animation
      animation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.current.start();

      // Wave animations
      waveAnimations.current = waveAnimationValues.map((value, index) => {
        const anim = Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(value, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        anim.start();
        return anim;
      });
    } else {
      // Clean up animations
      if (animation.current) {
        animation.current.stop();
        animation.current = null;
      }
      waveAnimations.current.forEach(anim => anim?.stop());
      waveAnimations.current = [];
      animationValue.setValue(0);
      waveAnimationValues.forEach(value => value.setValue(0));
    }

    return () => {
      if (animation.current) {
        animation.current.stop();
      }
      waveAnimations.current.forEach(anim => anim?.stop());
    };
  }, [isListening]);

  // Handle voice recognition setup and cleanup
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

  const stopListening = async () => {
    try {
      // Stop all animations
      if (animation.current) {
        animation.current.stop();
        animation.current = null;
      }

      waveAnimations.current.forEach((anim) => {
        if (anim) {
          anim.stop();
        }
      });
      waveAnimations.current = [];

      // Reset animation values
      animationValue.setValue(0);
      waveAnimationValues.forEach((value) => value.setValue(0));

      // Stop voice recognition
      await Voice.stop();

      // Update state
      setIsListening(false);
      setIsVerifying(false);
      setVerificationText('');

      // Clear any pending timeouts
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
        silenceTimeout.current = null;
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsListening(false);
    }
  };

  // Get the first 3 words of the next verse for verification
  const getNextVerseVerificationText = (verseIndex: number) => {
    const nextVerseIndex = verseIndex + 1;
    const nextVerse = hafsData[number]?.[nextVerseIndex];
    if (!nextVerse) return '';
    
    // Get first 3 words of the next verse
    const words = nextVerse.text.split(/\s+/).slice(0, 3);
    const verificationText = normalizeText(words.join(' '));
    console.log('Verification text:', verificationText);
    return verificationText;
  };

  const onSpeechResults = (event: { value?: string[] }) => {
    const text = event.value?.[0];
    if (!text || !isMounted.current) return;

    setSpokenText(text);
    
    // Clear any existing debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      if (!isMounted.current) return;
      
      const normalizedText = normalizeText(text);
      console.log('Normalized text:', normalizedText);
      
      if (normalizedText.length < 3) return;

      if (isVerifying) {
        // Verify the next verse
        const targetText = getNextVerseVerificationText(currentVerseIndex);
        console.log('Target text:', targetText);
        
        // Check if the spoken text matches the first 3 words of the next verse
        const isMatch = isVerificationMatch(normalizedText, targetText);
        console.log('Match result:', isMatch);
        
        if (isMatch) {
          // If match is correct, move to next verse
          const nextVerseIndex = currentVerseIndex + 1;
          if (nextVerseIndex < (hafsData[number]?.length || 0)) {
            setVerificationText('✅ Correct! Reading next verse...');
            setCurrentVerseIndex(nextVerseIndex);
            flatListRef.current?.scrollToIndex({
              index: nextVerseIndex,
              animated: true,
              viewPosition: 0.5,
            });
            // Reset for reading the new current verse
            setIsReadingCurrentVerse(true);
            setVerificationText('Read the current verse');
          }
        } else {
          // If no match, stay on current verse and prompt again
          setVerificationText('❌ Try again. Read the first 3 words of the next verse');
        }
        setIsVerifying(false);
      } else if (isReadingCurrentVerse) {
        // After reading current verse, prepare for next verse verification
        setIsReadingCurrentVerse(false);
        setIsVerifying(true);
        setVerificationText('Now read the first 3 words of the next verse');
      }
    }, 1000); // 1 second debounce
  };

  const { colors } = useTheme();

  // Reset verification state when starting to listen
  const handleStartListening = async () => {
    setIsReadingCurrentVerse(true);
    setIsVerifying(false);
    setVerificationText('Read the current verse');
    await startListening();
  };

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
        
        {/* Spoken Text and Verification Feedback */}
        <ThemedView style={[styles.feedbackContainer, { padding }]}>
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
          {spokenText ? (
            <ThemedText style={[styles.arabicText, {
              fontSize,
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
        onPress={isListening ? stopListening : handleStartListening}
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
  micButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  micButton: {
    borderRadius: 50,
    padding: 15,
    elevation: 5,
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
