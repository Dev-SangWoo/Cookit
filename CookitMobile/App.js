import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Login from './screens/Login';
import OnBoard from './screens/OnBoard';
import ModalVideo from './screens/modal/ModalVideo'
import ModalAi from './screens/modal/ModalAi'
import ModalSave from './screens/modal/ModalSave'
import ModalSummary from './screens/modal/ModalSummary'
import Search from './screens/search'
import Profile from './screens/Profile';
import Summary from './screens/Summary';
import SearchList from './screens/SearchList';
import SummaryChoice from './screens/SummaryChoice';
import ModalDelete from './screens/modal/ModalDelete';
import Recipe from './screens/Recipe';
import HomeTab from './screens/HomeTab';

const Stack = createNativeStackNavigator();





export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen options={{ headerShown: false }} name='OnBoard' component={OnBoard} />
          <Stack.Screen options={{ headerShown: false }} name='Login' component={Login} />
                    <Stack.Screen options={{ headerShown: false }} name='HomeTab' component={HomeTab} />

          <Stack.Screen options={{ headerShown: false }} name='Search' component={Search} />
          <Stack.Screen options={{ headerShown: false }} name='Profile' component={Profile} />
          <Stack.Screen options={{ headerShown: false }} name='Summary' component={Summary} />
          <Stack.Screen options={{ headerShown: false }} name='SearchList' component={SearchList} />
          <Stack.Screen options={{ headerShown: false }} name='SummaryChoice' component={SummaryChoice} />
          <Stack.Screen options={{ headerShown: false }} name='Recipe' component={Recipe} />

          <Stack.Screen options={{ headerShown: false }} name='ModalVideo' component={ModalVideo} />
          <Stack.Screen options={{ headerShown: false }} name='ModalAi' component={ModalAi} />
          <Stack.Screen options={{ headerShown: false }} name='ModalSave' component={ModalSave} />
          <Stack.Screen options={{ headerShown: false }} name='ModalSummary' component={ModalSummary} />
          <Stack.Screen options={{ headerShown: false }} name='ModalDelete' component={ModalDelete} />


        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}



const styles = StyleSheet.create({

});
