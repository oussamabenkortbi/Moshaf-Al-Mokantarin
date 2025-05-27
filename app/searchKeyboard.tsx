import React, { useState, useEffect, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Fuse from "fuse.js";
import { normalizeText } from "@/logic/normalizeText";
import quranData from "@/assets/data/chapters/en.json";
import hafsData from "@/assets/data/hafs.json";
import { router } from "expo-router";

export default function SearchKeyboard() {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{ text: string; verse: number; chapter: number }[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      <TextInput
        ref={inputRef}
        style={[styles.searchInput, { color: colors.text, borderColor: colors.primary }]}
        placeholder="Search Ayahs"
        placeholderTextColor={colors.text}
        value={searchQuery}
        onChangeText={handleSearchInput}
      />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
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
