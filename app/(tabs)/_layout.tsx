import { Link, Tabs } from 'expo-router'
import { Home, Dumbbell, UserRound, Sparkles } from 'lucide-react-native'
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
                },
                animation: 'shift',
            }}
        >
            <Tabs.Screen
                name='(home)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <Home size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
            />
            <Tabs.Screen
                name='(workouts)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <Dumbbell size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
            />    
            <Tabs.Screen
                name='(stats)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <Sparkles size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
            />    
            <Tabs.Screen
                name='(profile)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <UserRound size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
            />       
        </Tabs>
    )
}