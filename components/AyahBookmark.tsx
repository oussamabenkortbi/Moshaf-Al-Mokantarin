import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Text as ThemedText, View as ThemedView } from "./Themed";

interface AyahBookmarkProps {
  item: {
    text: string;
    chapter: number;
    verse: number;
  };
  padding: number;
  fontSize: number;
  fontFamily: 'warsh' | 'hafs';
  textColor?: string;
}

export default function AyahBookmark({ 
  item, 
  padding, 
  fontSize, 
  fontFamily, 
  textColor = '#FFFFFF' 
}: AyahBookmarkProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <ThemedView style={[styles.container, {
      backgroundColor: isBookmarked ? 'rgba(229, 174, 45, 0.2)' : 'transparent'
    }]}>
      <Pressable
        style={styles.surahItem}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      >
        <ThemedView style={[styles.textContainer, { padding }]}>
          <ThemedText 
            style={[styles.arabicText, {
              fontSize,
              fontFamily,
              color: textColor,
              lineHeight: fontSize * 1.8, // Better line height for Arabic text
            }]}
            selectable
            selectionColor="rgba(229, 174, 45, 0.5)"
          >
            {item.text}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  arabicText: {
    textAlign: 'center',
    writingDirection: 'rtl',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});