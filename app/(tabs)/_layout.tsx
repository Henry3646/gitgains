import { Link, Tabs } from 'expo-router'
import { Home, Dumbbell, UserRound } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants';

export default function TabLayout() {
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingTop: 15,
                }
            }}
        >
            <Tabs.Screen
                name='(home)'
                options={{
                    headerShown: true,
                    tabBarIcon: (({ focused }) => <Home size={40} color={theme.text} strokeWidth={focused ? 2: 1}/>),
                    tabBarShowLabel: false,
                }}
            />
            <Tabs.Screen
                name='(workouts)'
                options={{
                    headerShown: true,
                    tabBarIcon: (({ focused }) => <Dumbbell size={40} color={theme.text} strokeWidth={focused ? 2: 1}/>),
                    tabBarShowLabel: false,
                }}
            />    
            <Tabs.Screen
                name='(stats)'
                options={{
                    headerShown: true,
                    tabBarIcon: (({ focused }) => <Dumbbell size={40} color={theme.text} strokeWidth={focused ? 2: 1}/>),
                    tabBarShowLabel: false,
                }}
            />    
            <Tabs.Screen
                name='(profile)'
                options={{
                    headerShown: true,
                    tabBarIcon: (({ focused }) => <UserRound size={40} color={theme.text} strokeWidth={focused ? 2: 1}/>),
                    tabBarShowLabel: false,
                }}
            />       
        </Tabs>
    )
}