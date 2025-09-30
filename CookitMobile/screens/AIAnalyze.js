import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIAnalyze({ navigation }) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 환경변수에서 API URL 가져오기 (fallback 포함)
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const analyzeYouTubeVideo = async () => {
    if (!url.trim()) {
      Alert.alert('오류', 'YouTube URL을 입력해주세요.');
      return;
    }

    // YouTube URL 유효성 검사
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      Alert.alert('오류', '올바른 YouTube URL을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRecipe(null);

    try {
      console.log('🎬 YouTube 분석 시작:', url);
      
      const response = await fetch(`${API_BASE_URL}/ai/analyze-youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      if (data.success && data.recipe) {
        setRecipe(data.recipe);
        console.log('✅ 분석 완료:', data.recipe.title);
        
        // 레시피 ID가 있으면 자동으로 레시피 화면으로 이동
        if (data.recipeId) {
          console.log('🎯 레시피 화면으로 이동:', data.recipeId);
          Alert.alert(
            '분석 완료!',
            '레시피가 생성되었습니다. 레시피 화면으로 이동하시겠습니까?',
            [
              {
                text: '취소',
                style: 'cancel',
              },
              {
                text: '확인',
                onPress: () => {
                  navigation.navigate('Recipe', { recipeId: data.recipeId });
                },
              },
            ]
          );
        }
      } else {
        throw new Error('레시피 데이터를 받지 못했습니다.');
      }
    } catch (error) {
      console.error('❌ 분석 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      Alert.alert('분석 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/from-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResult: { recipe },
          sourceUrl: url,
          processingMetadata: {
            videoId: url.match(/[?&]v=([^&]+)/)?.[1] || 'unknown',
            processingTime: null,
            textSources: { ocr: true, whisper: true, subtitles: true }
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '저장 중 오류가 발생했습니다.');
      }

      Alert.alert('성공', '레시피가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('❌ 레시피 저장 실패:', error);
      Alert.alert('저장 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderIngredients = () => {
    if (!recipe?.ingredients?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>재료</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>
              • {ingredient.name}
            </Text>
            <Text style={styles.ingredientQuantity}>
              {ingredient.quantity} {ingredient.unit}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSteps = () => {
    if (!recipe?.steps?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>조리 단계</Text>
        {recipe.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepInstruction}>{step.instruction}</Text>
            {step.time && (
              <Text style={styles.stepDetail}>⏱️ {step.time}</Text>
            )}
            {step.temperature && (
              <Text style={styles.stepDetail}>🌡️ {step.temperature}</Text>
            )}
            {step.tips && (
              <Text style={styles.stepDetail}>💡 {step.tips}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderRecipeInfo = () => {
    if (!recipe) return null;

    return (
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        {recipe.description && (
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
        )}
        
        <View style={styles.recipeMeta}>
          {recipe.prep_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>준비시간</Text>
              <Text style={styles.metaValue}>{recipe.prep_time}</Text>
            </View>
          )}
          {recipe.cook_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>조리시간</Text>
              <Text style={styles.metaValue}>{recipe.cook_time}</Text>
            </View>
          )}
          {recipe.servings && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>인분</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
          )}
          {recipe.difficulty && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>난이도</Text>
              <Text style={styles.metaValue}>{recipe.difficulty}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 요리 분석</Text>
          <Text style={styles.headerSubtitle}>
            YouTube 요리 영상을 분석하여 레시피를 생성합니다
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.urlInput}
            placeholder="YouTube URL을 입력하세요"
            placeholderTextColor="#999"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />
          
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={analyzeYouTubeVideo}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.analyzeButtonText}>분석 시작</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {recipe && (
          <View style={styles.resultContainer}>
            {renderRecipeInfo()}
            {renderIngredients()}
            {renderSteps()}
            
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={saveRecipe}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>레시피 저장</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    color: '#666',
  },
  inputSection: {
    marginBottom: 30,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: 'orange',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'orange',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeInfo: {
    marginBottom: 24,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipeDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    color: '#666',
  },
  recipeMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    color: '#999',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientName: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  ingredientQuantity: {
    fontSize: 14,
    opacity: 0.7,
    color: '#666',
  },
  stepItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    backgroundColor: 'orange',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    color: '#333',
  },
  stepInstruction: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  },
  stepDetail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    color: '#666',
  },
});
