import React, { useState, useEffect, useRef } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedContainer, Text } from "@/components/Themed";
import { useTheme } from "@/contexts/ThemeContext";
import Voice from "@react-native-community/voice";
import Fuse from "fuse.js";
import { normalizeText } from "@/logic/normalizeText";
import quranData from "@/assets/data/chapters/en.json";
import hafsData from "@/assets/data/hafs.json";
import { router } from "expo-router";

type Verse = {
  chapter: number;
  verse: number;
  text: string;
};

type HafsData = {
  [key: string]: Verse[];
};

export default function Search() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState<Verse[]>([]);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start("ar-SA");
    } catch (error) {
      console.error("Error starting voice recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
      setSearchQuery("");
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  };

  const onSpeechResults = (event: { value?: string[] }) => {
    const spokenText = event.value?.[0];
    if (!spokenText || spokenText.length < 10) return;
    const normalizedSpokenText = normalizeText(spokenText);
    setSearchQuery(spokenText);
    performSearch(normalizedSpokenText);
  };

  const performSearch = (query: string) => {
    const verses = Object.values(hafsData).flat().map((verse) => {
      const normalizedVerseText = normalizeText(verse.text);
      return {
        text: normalizedVerseText,
        verse: verse.verse,
        chapter: verse.chapter,
      };
    });

    const fuse = new Fuse(verses, { keys: ["text"], threshold: 0.5 });
    const results = fuse.search(query);
    setSearchResults(results.map((result) => result.item));
  };

  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
    performSearch(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text, borderColor: colors.primary }]}
          placeholder="Search Ayahs"
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={handleSearchInput}
        />
        <Pressable onPress={isListening ? stopListening : startListening}>
          <MaterialCommunityIcons
            name={isListening ? "pause-circle" : "microphone"}
            size={36}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {searchResults.length === 0 && searchQuery !== "" ? (
        <Text style={styles.noResultsText}>No Results Found</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.chapter}-${item.verse}-${index}`}
          renderItem={({ item }) => (
            <Pressable onPress={() => {
              router.replace(`/surah?number=${item.chapter}&ayah=${item.verse - 1}`);
            }} style={styles.resultItem}>
              <Text style={{ color: colors.text }}>
                {`${quranData[item.chapter - 1].name}, ${item.verse}: ${item.text}`}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  noResultsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
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
});
