import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

export default function AyahBookmark({ item, padding, fontSize }: {
  item: {
    chapter: number;
    verse: number;
    text: string;
  },
  padding: number
  fontSize: number
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <View style={[styles.container, {
      backgroundColor: isBookmarked ? '#E5AE2D' : '#000'
    }]}>
      <Pressable
        style={styles.surahItem}
      >
        <View style={[styles.textContainer, {
          padding,
        }]}>
          <Text style={[styles.arabicText, {
            fontSize,
          }]}>
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
    textAlign: 'left',
    fontFamily: 'hafs',
  }
});