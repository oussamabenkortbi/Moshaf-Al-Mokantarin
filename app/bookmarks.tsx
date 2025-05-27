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
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  spokenText: {
    marginVertical: 8,
    fontSize: 16,
    textAlign: "center",
  },
  resultItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
