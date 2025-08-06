import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


const OnBoardModal1 = () => {
  const navigation = useNavigation();



  return (
    <SafeAreaView>
    <View>
      <Text>영상을 고르세요!
        (작게) 유튜브를 기반으로 검색합니다
      </Text>

    </View>
    </SafeAreaView>
  )
}

export default OnBoardModal1

const styles = StyleSheet.create({})