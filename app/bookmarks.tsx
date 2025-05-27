import React, { useState, useEffect } from "react";
import { FlatList, Pressable, StatusBar, StyleSheet } from "react-native";
import quranData from "@/assets/data/chapters/en.json";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { toArabicWord } from "@/logic/towords";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";

type Bookmark = {
  chapter: number;
  verse: number;
  text: string;
};

export default function Bookmarks() {
  const { colors } = useTheme();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const bookmarksStorage = await AsyncStorage.getItem("bookmarks");
        const storedBookmarks = JSON.parse(bookmarksStorage || "[]");
        setBookmarks(storedBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {bookmarks.length === 0 ? (
        <Text style={styles.noBookmarksText}>No Bookmarks Found</Text>
      ) : (
        <FlatList
          data={bookmarks}
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  noBookmarksText: {
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
