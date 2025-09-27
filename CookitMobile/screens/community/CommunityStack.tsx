// 커뮤니티 화면 스택
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityMain from './CommunityMain';
import CommunityDetail from './CommunityDetail';
import CommunityCreate from './CommunityCreate';

export type CommunityStackParamList = {
  CommunityMain: undefined; 
  CommunityDetail: { postId: string };
  CommunityCreate: undefined;
};


const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CommunityMain"
    >
      <Stack.Screen name="CommunityMain" component={CommunityMain} />
      <Stack.Screen name="CommunityDetail" component={CommunityDetail} />
      <Stack.Screen name="CommunityCreate" component={CommunityCreate} />
    </Stack.Navigator>
  );
}