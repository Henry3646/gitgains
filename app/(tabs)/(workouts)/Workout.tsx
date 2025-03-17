import React, {useState, useEffect, useCallback} from 'react'
import { ScrollView, RefreshControl, View, Alert } from 'react-native'
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

  const handleEditWorkout = (workout: any) => {
    router.push({ 
      pathname: '/EditWorkout',
      params: { workoutId: workout.id }
    })
  }

  const handleDeleteWorkout = async (workout: any) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('Workouts')
                .delete()
                .eq('id', workout.id)

              if (error) throw error

              // Refresh the workouts list
              const userId = await getCurrentUserId()
              await getWorkoutsForUser(userId)
            } catch (error) {
              console.error('Error deleting workout:', error)
              Alert.alert('Error', 'Failed to delete workout')
            }
          }
        }
      ]
    )
  }

  return (
    <View className={`flex-col w-full h-full pt-16 px-4`}
            style={{
                backgroundColor: theme.background,
            }}
        >
            <H2 className=''>Create Workout</H2>
            <View className='w-full items-center py-4'>
                <Button 
                    className='w-full flex-row justify-center items-center gap-2' 
                    variant="outline" 
                    onPress={() => router.push({ pathname: '/(tabs)/(workouts)/NewWorkout' })}
                >
                    <Plus size={20} color={theme.text} strokeWidth={2} />
                    <Text>Create New Workout</Text>
                </Button>
            </View>
            <H2 className=''>Saved Workouts</H2>
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
                            <SwipeableRow 
                                key={workout.id} 
                                onEdit={() => handleEditWorkout(workout)} 
                                onDelete={() => handleDeleteWorkout(workout)}
                            >
                                <SavedWorkout workout={workout} setModalVisible={() => {}} />
                            </SwipeableRow>
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