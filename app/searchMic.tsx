import React, { useState, useEffect, useRef } from "react";
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import Voice from "@react-native-community/voice";
import Fuse from "fuse.js";
import { normalizeText } from "@/logic/normalizeText";
import quranData from "@/assets/data/chapters/en.json";
import hafsData from "@/assets/data/hafs.json";
import { router } from "expo-router";
import { Text as ThemedText, View as ThemedView } from "@/components/Themed";

export default function SearchMic() {
  const { colors } = useTheme();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ text: string; verse: number; chapter: number }[]>([]);
  const [spokenText, setSpokenText] = useState<string>("");
  const [riwaya, setRiwaya] = useState<'hafs' | 'warsh'>('hafs');
  const [emptyListText, setEmptyListText] = useState<string>("إقرأ آية للبحث عنها");

  const padding = 16; // Default padding value
  const fontSize = 18; // Default font size value

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

  // Search and data
  const fuseInstance = useRef<Fuse<{ text: string; verse: number; chapter: number }> | null>(null);
  const normalizedVerses = useRef<{ text: string; verse: number; chapter: number }[]>([]);
  const isMounted = useRef(true);

  const startListening = async () => {
    if (!isMounted.current) return;
    
    try {
      setIsListening(true);
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

      // Clear any pending timeouts
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
        silenceTimeout.current = null;
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }

      // Navigate to the first verse after 3 seconds if results exist
      if (searchResults.length > 0) {
        silenceTimeout.current = setTimeout(() => {
          const firstResult = searchResults[0];
          router.replace(`/surah?number=${firstResult.chapter}&ayah=${firstResult.verse - 1}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsListening(false);
    }
  };

  // Initialize Fuse instance with normalized verses
  useEffect(() => {
    isMounted.current = true;
    
    // Preload and normalize verses
    normalizedVerses.current = Object.values(hafsData).flat().map((verse) => ({
      text: normalizeText(verse.text),
      verse: verse.verse,
      chapter: verse.chapter,
    }));

    // Initialize Fuse with normalized verses
    fuseInstance.current = new Fuse(normalizedVerses.current, {
      keys: ['text'],
      threshold: 0.5,
      includeScore: true,
      minMatchCharLength: 3
    });

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle speech recognition results
  useEffect(() => {
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
        if (normalizedText.length < 3) {
          setSearchResults([]);
          setEmptyListText('حاول مجددا'); // Update empty list text after 1 second
          return;
        }

        try {
          const results = fuseInstance.current?.search(normalizedText) || [];
          setSearchResults(results.slice(0, 10).map(r => r.item));
          if (results.length === 0) {
            setEmptyListText('حاول مجددا'); // Update empty list text if no results
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setEmptyListText('حاول مجددا'); // Update empty list text on error
        }
      }, 1000); // 1 second debounce
    };

    Voice.onSpeechResults = onSpeechResults;
    
    // Add 500ms delay before starting to listen
    const startListeningTimeout = setTimeout(() => {
      if (isMounted.current) {
        startListening();
      }
    }, 500);
    
    return () => {
      clearTimeout(startListeningTimeout);
    };
  }, []);

  // Main animation effect
  useEffect(() => {
    animation.current = Animated.loop(
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
    );
    
    animation.current.start();

    return () => {
      if (animation.current) {
        animation.current.stop();
      }
    };
  }, [animationValue]);

  // Wave animations effect
  useEffect(() => {
    waveAnimationValues.forEach((value, index) => {
      const waveAnimation = Animated.loop(
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
      );
      
      waveAnimation.start();
      waveAnimations.current.push(waveAnimation);
    });

    return () => {
      waveAnimations.current.forEach(anim => anim.stop());
      waveAnimations.current = [];
    };
  }, [waveAnimationValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      if (animation.current) animation.current.stop();
      waveAnimations.current.forEach(anim => anim.stop());
      Voice.destroy().catch(console.error);
    };
  }, []);

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

  useEffect(() => {
    const handleSpeechVolumeChanged = (event: { value?: number }) => {
      console.log('Speech volume changed:', event.value);
    };

    Voice.onSpeechVolumeChanged = handleSpeechVolumeChanged;

    return () => {
      Voice.onSpeechVolumeChanged = () => {}; // Set to an empty function to prevent warnings
    };
  }, []);

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
        ListEmptyComponent={
          <ThemedText
            style={[styles.arabicText, {
              fontSize,
              fontFamily: riwaya === 'hafs' ? 'hafs' : 'warsh',
              color: colors.text,
              textAlign: 'center',
              marginTop: 16,
            }]}
          >
            {emptyListText}
          </ThemedText>
        }
        style={styles.flatList}
        
      />

      <Pressable onPress={isListening ? stopListening : startListening} style={styles.micButtonContainer}>
        <View style={styles.waveContainer}>
          {isListening && waveStyles.map((style, index) => (
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
