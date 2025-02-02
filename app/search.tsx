import { FlatList, Pressable, StatusBar, StyleSheet } from "react-native";
import quranData from "@/assets/data/chapters/en.json";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { toArabicWord } from "@/logic/towords";

export default function Search() {

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        hidden
      />
      <FlatList
        style={{ width: '100%' }}
        data={quranData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Pressable style={styles.surahItem} onPress={() => router.push(`/surah?number=${item.id}&ayah=0`)}>
            <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#000' }}>
              <View style={styles.surahNumberContainer}>
                <Feather name="hexagon" size={36} color="#E5AE2D" />
                <Text style={styles.surahNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.surahName}>سورة {item.name}</Text>
            </View>
            <Text style={styles.surahIndex}>{item.type === "meccan" ? "مكية" : "مدنية"} وآياتها {toArabicWord(item.total_verses)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#000'
  },
  surahNameContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  surahItem: { 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: '100%',
    backgroundColor: '#000'
  },
  surahName: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#fff'
  },
  surahNumber: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#fff',
    position: "absolute",
  },
  surahNumberContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    marginLeft: 10,
    backgroundColor: '#000'
  },
  surahIndex: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'hafs',
    color: '#E5AE2D'
  },
});
