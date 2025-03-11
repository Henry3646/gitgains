import React, {useState, useEffect, useCallback} from 'react'
import { ScrollView, RefreshControl, View } from 'react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { H2 } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { Text } from '~/components/ui/text'
import { Plus } from 'lucide-react-native'
import SavedWorkout from '~/components/Home/SavedWorkout'
import { supabase } from '~/lib/supabase'
import { router } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'
import SwipeableRow from '~/components/SwipeableRow'


const Workout = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [refreshing, setRefreshing] = useState(false)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getWorkoutsForUser = async (userId: any) => {
    if (!userId) return

    const { data, error } = await supabase
      .from('Workouts')
      .select('*')
      .eq('user_id', userId)

    if (error) {
        console.error('Error fetching workouts:', error)
        return
    }
    if (data) {
        setWorkouts(data)
    }
  }

  const refreshWorkouts = async () => {
    setRefreshing(true)
    const userId = await getCurrentUserId()
    await getWorkoutsForUser(userId)
    setRefreshing(false)
  }

  useFocusEffect(
          useCallback(() => {
            setLoading(true)
            console.log('useFocusEffect')
            getCurrentUserId().then((userId: any) => {
                getWorkoutsForUser(userId)
            })
            setLoading(false)
          }, [])
        )

    useEffect(() => {
        setLoading(true)
        getCurrentUserId().then((userId: any) => {
            getWorkoutsForUser(userId)
        })
        setLoading(false)
    }, [])
  return (
    <View className={`flex-col w-full h-full mt-14`}
            style={{
                backgroundColor: theme.background,
            }}
        >
            <H2 className='ml-[5%] pt-6'>Create Workout</H2>
            <View className='w-full items-center'>
                <Button className='w-[90%] mt-4' onPress={() => router.push({ pathname: '/(tabs)/(workouts)/NewWorkout' })}>
                    <Plus size={30} color={theme.background} strokeWidth={2}/>
                </Button>
            </View>
            <H2 className='ml-[5%] pt-6'>Saved Workouts</H2>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshWorkouts}
                    />
                }
            >
                <View className='flex-col w-full items-center mt-4 pb-16'>
                    {loading ? 
                    <Skeleton className=' w-[90%] h-[140px]' />
                    :
                    <>
                    {workouts.length > 0 ?
                        <>
                        {workouts.map((workout: any) => (
                            <SwipeableRow key={workout.id} children={<SavedWorkout  workout={workout} />} onEdit={() => console.log()} onDelete={() => console.log()} />
                        ))}
                        </>
                        :
                        <Text>No saved workouts</Text>
                    }</>    
                }
                    
                </View>
            </ScrollView>
        </View>
  )
}

export default Workout