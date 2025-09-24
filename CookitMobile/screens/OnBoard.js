// 앱을 켰을 때 제일 처음 보게될 화면
// npx expo install @react-native-async-storage/async-storage
/*
          <TouchableOpacity
            style={styles.buttonStart}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

  buttonStart: {
    backgroundColor: 'orange',
    borderRadius: 50,
    width: '100%',
    paddingVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
*/




import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnBoard = () => {

  const navigation = useNavigation();

const handleStart = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (userId) {
    navigation.replace("HomeTab");
  } else {
    navigation.replace("Login");
  }
};

  return (
    <>
      <View style={styles.container}>
        <Image source={require('../assets/signature.png')} style={styles.signature} />
        <Text style={styles.pageTitle}>Cookit</Text>
        <Text style={styles.titleText}>영상 한 편이면 요리는 끝!</Text>

        <TouchableOpacity onPress={() => setModalVisible('one')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>📽️</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>비디오 레시피 분석</Text>
              <Text style={styles.listText}>영상에서 자동으로 레시피를 추출하고 분석해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible('two')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>🤖</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>AI 단계별 가이드</Text>
              <Text style={styles.listText}>AI가 맞춤형 요리 가이드를 단계별로 제공해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible('three')}>
          <View style={styles.listBox}>
            <Text style={styles.listIcon}>💾</Text>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>레시피 저장 & 공유</Text>
              <Text style={styles.listText}>좋아하는 레시피를 저장하고 친구들과 공유해요</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonContiner}>
          <TouchableOpacity
            style={styles.buttonStart}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

    </>
  )
}

export default OnBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24   
  },
  signature: {
    width:120,
    height:120
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 25
  },
  titleText: {
    fontSize: 17,
    marginBottom: 20,
    opacity: 0.5
  },
  listBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 192, 141, 0.65)',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    width: '100%',
    paddingVertical: 25
  },
  listIcon: {
    fontSize: 30,                       
    marginRight: 12
  },
  listTextGroup: {
    flex: 1                            
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  listText: {
    fontSize: 13,
    opacity: 0.5
  },
  buttonContiner: {
    width:'100%',
  },
  buttonStart: {
    backgroundColor: 'orange',
    borderRadius: 50,
    width: '100%',
    paddingVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },

});
