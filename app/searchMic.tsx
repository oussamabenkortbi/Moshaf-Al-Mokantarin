import React, { useState, useEffect, useRef } from "react";
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import Voice from "@react-native-community/voice";
import Fuse from "fuse.js";
import { normalizeText } from "@/logic/normalizeText";
import quranData from "@/assets/data/chapters/en.json";
import hafsData from "@/assets/data/hafs.json";
import { router } from "expo-router";
import { Text as ThemedText, View as ThemedView, ThemedContainer } from "@/components/Themed";

export default function SearchMic() {
  const { colors } = useTheme();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ text: string; verse: number; chapter: number }[]>([]);
  const [spokenText, setSpokenText] = useState<string>("");
  const [riwaya, setRiwaya] = useState<'hafs' | 'warsh'>('hafs');

  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const padding = 16; // Default padding value
  const fontSize = 18; // Default font size value

  const animationValue = useRef(new Animated.Value(0)).current;
  const waveAnimationValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const normalizedVerses = useRef<{ text: string; verse: number; chapter: number }[]>([]);
  const intermediateSpokenText = useRef<string>("");

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

  useEffect(() => {
    // Preload normalized verses into memory
    normalizedVerses.current = Object.values(hafsData).flat().map((verse) => {
      const normalizedVerseText = normalizeText(verse.text);
      return {
        text: normalizedVerseText,
        verse: verse.verse,
        chapter: verse.chapter,
      };
    });
  }, []);

  useEffect(() => {
    const handleRapidInteractions = () => {
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }
    };

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const onSpeechResults = (event: { value?: string[] }) => {
      handleRapidInteractions(); // Ensure timeout cleanup for rapid interactions

      const spokenText = event.value?.[0];
      if (!spokenText) return;

      // Update intermediate spoken text immediately
      intermediateSpokenText.current = spokenText;

      // Debounce the search logic to avoid frequent heavy computations
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        const normalizedSpokenText = normalizeText(intermediateSpokenText.current);

        const fuse = new Fuse(normalizedVerses.current, { keys: ['text'], threshold: 0.5 });
        const results = fuse.search(normalizedSpokenText);

        // Batch state updates for search results
        setSearchResults(results.map((result) => result.item));

        if (results.length > 0) {
          silenceTimeout.current = setTimeout(() => {
            const firstResult = results[0].item;
            router.replace(`/surah?number=${firstResult.chapter}&ayah=${firstResult.verse - 1}`);
          }, 5000);
        }
      }, 300); // Debounce delay of 300ms
    };

    Voice.onSpeechResults = onSpeechResults;

    startListening();

    return () => {
      stopListening();
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animationValue]);

  useEffect(() => {
    const startWaveAnimations = () => {
      waveAnimationValues.forEach((value, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 1500,
              delay: index * 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    };

    startWaveAnimations();
  }, [waveAnimationValues]);

  const waveStyles = waveAnimationValues.map((value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    }),
    transform: [
      {
        scale: value.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 3],
        }),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <ThemedView style={[styles.textContainer, { padding }]}> 
        <ThemedText style={[styles.arabicText, {
          fontSize,
          fontFamily: riwaya === 'hafs' ? 'hafs' : 'warsh',
          color: colors.text,
        }]}> 
          {spokenText}
        </ThemedText>
      </ThemedView>

      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.chapter}-${item.verse}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.replace(`/surah?number=${item.chapter}&ayah=${item.verse - 1}`);
            }}
            style={styles.resultItem}
          >
            <Text style={{ color: colors.text }}>
              {`${quranData[item.chapter - 1].name}, ${item.verse}: ${item.text}`}
            </Text>
          </Pressable>
        )}
        style={styles.flatList}
      />

      <Pressable onPress={isListening ? stopListening : startListening} style={styles.micButtonContainer}>
        <View style={styles.waveContainer}>
          {waveStyles.map((style, index) => (
            <Animated.View key={index} style={[styles.wave, style]} />
          ))}
          <MaterialCommunityIcons name={isListening ? 'pause-circle' : 'microphone'} size={50} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  textContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
  },
  arabicText: {
    fontSize: 18,
    fontFamily: "hafs",
    color: "#000",
  },
  callToActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callToActionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 16,
  },
  microphoneIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#888',
  },
  flatList: {
    flex: 1,
    maxHeight: 200,
  },
  micButtonContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
