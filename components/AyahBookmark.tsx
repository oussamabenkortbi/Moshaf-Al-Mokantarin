import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

export default function AyahBookmark({ item }: {
  item: {
    chapter: number;
    verse: number;
    text: string;
  }
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if current verse is bookmarked
  const checkBookmark = async () => {
    try {
      const bookmarksStorage = await AsyncStorage.getItem("bookmarks");
      const bookmarks = JSON.parse(bookmarksStorage || '[]');
      
      const exists = bookmarks.some((bookmark: typeof item) => 
        bookmark.chapter === item.chapter && 
        bookmark.verse === item.verse
      );
      
      setIsBookmarked(exists);
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  // Toggle bookmark status
  const toggleBookmark = async () => {
    try {
      const bookmarksStorage = await AsyncStorage.getItem("bookmarks");
      const bookmarks = JSON.parse(bookmarksStorage || '[]');

      const newBookmarks = isBookmarked
        ? bookmarks.filter((bookmark: typeof item) => 
            !(bookmark.chapter === item.chapter && 
              bookmark.verse === item.verse)
          )
        : [...bookmarks, item];

      await AsyncStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  useEffect(() => {
    checkBookmark();
  }, [item]); // Re-check when item changes

  return (
    <View style={[styles.container, {
      backgroundColor: isBookmarked ? '#C99C33' : '#000'
    }]}>
      <Pressable
        onLongPress={toggleBookmark}
        style={styles.surahItem}
      >
        <View style={[styles.textContainer]}>
          <Text style={styles.arabicText}>
            {item.text}
          </Text>
        </View>
      </Pressable>
    </View>
  );
  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  surahItem: {
    width: '100%',
    height: Dimensions.get('window').height,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    color: 'white',
    fontSize: 26,
    textAlign: 'center',
    writingDirection: 'rtl',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'hafs',
  },
  verseText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'left',
    marginTop: 20,
    fontFamily: 'hafs',
  }
});