// 요약할지 말지 정하는 곳
// 요약하기 버튼을 누르면 요약 시작




import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeSummaryModal from '../Recipe/RecipeSummaryModal';
import { useState } from 'react';

const SearchSummary = ({ route, navigation }) => {
  const { thumbnail, title, creator, recipeId } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSummaryPress = () => {
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
      <View style={styles.container}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.creator}>제작자: {creator}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#ff6b6b' }]}
            onPress={handleSummaryPress}
          >
            <Text style={styles.btnText}>요약하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>뒤로가기</Text>
          </TouchableOpacity>

        </View>
      </View>

      <RecipeSummaryModal
        isVisible={isModalVisible}
        onComplete={() => {
          setIsModalVisible(false);
          navigation.navigate('RecipeSummary', { recipeId });
        }}
      />
    </SafeAreaView>
  );
};

export default SearchSummary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  creator: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF'
  },
  btnText: {
    color: '#fff',
    fontSize: 16
  }
});
