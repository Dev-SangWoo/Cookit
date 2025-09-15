// screens/community/CommunityStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Community from './Community';
import PostDetail from './PostDetail';
import CreatePost from './CreatePost';

export type CommunityStackParamList = {
  CommunityMain: undefined; // CommunityMain에는 파라미터가 필요 없다고 명시
  PostDetail: { postId: string };
  CreatePost: undefined;
};

// createNativeStackNavigator에 타입을 적용
const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CommunityMain"
    >
      <Stack.Screen name="CommunityMain" component={Community} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
    </Stack.Navigator>
  );
}