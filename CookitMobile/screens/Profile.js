// 프로필 화면


import { Platform, StyleSheet, Text, TouchableOpacity, View,  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'


const Profile = () => {

  const navigation = useNavigation();

const handleLogout = async () => {
    try {

      navigation.replace('OnBoard');
    } catch (error) {
      console.log(error.message);
    }
  }


  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 15 : 0 }}>
    <View>
      <Text>Profile</Text>
    </View>


            <TouchableOpacity
              style={styles.logOutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logOutText}>-</Text>
            </TouchableOpacity>




    </SafeAreaView>
  )
}

export default Profile;

const styles = StyleSheet.create({
  logOutButton: {
    marginBottom: 25,
    marginRight: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4
  }

})