import { View, Modal, ScrollView, RefreshControl, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { H1, H2, H3, H4 } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react-native'
import { supabase } from '~/lib/supabase'
import getCurrentUserId from '~/lib/getCurrentUserId'
import SavedWorkout from './SavedWorkout'
import { Text } from '~/components/ui/text'
import { router } from 'expo-router'
import SwipeableRow from '~/components/SwipeableRow'


const WorkoutsModal = ({ modalVisible, setModalVisible}: {modalVisible: any, setModalVisible: any}) => {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  const [refreshing, setRefreshing] = useState(false)
  const [workouts, setWorkouts] = useState<any[]>([])

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
    await getCurrentUserId().then((userId: any) => {
      getWorkoutsForUser(userId)
    })
    setRefreshing(false)
  }
  
  const handleNewWorkout = () => {
    setModalVisible(!modalVisible)
    router.push({ pathname: '/(tabs)/(workouts)/NewWorkout' })
}

  const handleEditWorkout = (workout: any) => {
    setModalVisible(false)
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
              await getCurrentUserId().then((userId: any) => {
                getWorkoutsForUser(userId)
              })
            } catch (error) {
              console.error('Error deleting workout:', error)
              Alert.alert('Error', 'Failed to delete workout')
            }
          }
        }
      ]
    )
  }

    useEffect(() => {
        getCurrentUserId().then((userId: any) => {
            getWorkoutsForUser(userId)
        })
    }, [])

  
  return (
    <Modal
        animationType='slide'
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
    >
        <View className={`flex-col w-full h-full pt-16 px-4 `}
            style={{
                backgroundColor: theme.background,
            }}
        >
            <X 
                size={40} 
                color={theme.text} 
                strokeWidth={1.5} 
                onPress={() => setModalVisible(!modalVisible)} 
                 
                
            />
            <H2 className=' pt-6'>Create Workout</H2>
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
                <View className='flex-col w-full items-center mt-4 pb-20'>
                    {workouts.length > 0 ?
                        <>
                        {workouts.map((workout: any) => (
                            <SwipeableRow 
                                key={workout.id} 
                                onEdit={() => handleEditWorkout(workout)} 
                                onDelete={() => handleDeleteWorkout(workout)}
                            >
                                <SavedWorkout 
                                    workout={workout} 
                                    setModalVisible={setModalVisible}
                                />
                            </SwipeableRow>
                        ))}
                        </>
                        :
                        <Text>No saved workouts</Text>
                    }
                </View>
            </ScrollView>
        </View>
    </Modal>
  )
}

export default WorkoutsModal