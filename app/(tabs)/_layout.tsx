import { Link, Tabs, router, useSegments } from 'expo-router'
import { Home, Dumbbell, UserRound, Sparkles } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants';

export default function TabLayout() {
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    const segments = useSegments();
    const currentTab = segments[1]; // Get the current tab from segments

    const handleTabPress = (route: string) => {
        // Remove parentheses for comparison
        const targetTab = route.replace(/[()]/g, '');
        
        // If we're already on this tab, do nothing
        if (currentTab === `(${targetTab})`) {
            return;
        }
        console.log(currentTab)
        console.log(targetTab)

        switch (route) {
            case '(home)':
                router.replace('/(tabs)/(home)/Home')
                break
            case '(workouts)':
                router.replace('/(tabs)/(workouts)/Workout')
                break
            case '(profile)':
                router.replace('/(tabs)/(profile)/Profile')
                break
        }
    }

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
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault()
                        handleTabPress('(home)')
                    }
                }}
            />
            <Tabs.Screen
                name='(workouts)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <Dumbbell size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault()
                        handleTabPress('(workouts)')
                    }
                }}
            />    
            <Tabs.Screen
                name='(profile)'
                options={{
                    headerShown: false,
                    tabBarIcon: (({ focused }) => <UserRound size={40} color={theme.text} strokeWidth={focused ? 1.5: 1}/>),
                    tabBarShowLabel: false,
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault()
                        handleTabPress('(profile)')
                    }
                }}
            />       
        </Tabs>
    )
}