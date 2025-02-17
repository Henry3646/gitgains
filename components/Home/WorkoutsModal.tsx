import { View, Modal, ScrollView, RefreshControl } from 'react-native'
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
    await getWorkoutsForUser('e9cac5f4-62df-46bd-afc4-08d89aba2f51')
    setRefreshing(false)
  }
  
  const handleNewWorkout = () => {
    setModalVisible(!modalVisible)
    router.push({ pathname: '/(tabs)/(workouts)/NewWorkout' })
}

    useEffect(() => {
        getCurrentUserId().then((userId: any) => {
            getWorkoutsForUser('e9cac5f4-62df-46bd-afc4-08d89aba2f51')
        })
    }, [])

    useEffect(() => {
        console.log(workouts)
    }, [])
  
  return (
    <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
    >
        <View className={`flex-col w-full h-full mt-14`}
            style={{
                backgroundColor: theme.background,
            }}
        >
            <X 
                size={40} 
                color={theme.text} 
                strokeWidth={1.5} 
                onPress={() => setModalVisible(!modalVisible)} 
                style={{
                    marginLeft: '3%'
                }} 
                
            />
            <H2 className='ml-[5%] pt-6'>Create Workout</H2>
            <View className='w-full items-center'>
                <Button className='w-[90%] mt-4' onPress={handleNewWorkout}>
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
                <View className='flex-col w-full items-center mt-4'>
                    {workouts.length > 0 ?
                        <>
                        {workouts.map((workout: any) => (
                            <SwipeableRow key={workout.id} children={<SavedWorkout  workout={workout} />} onEdit={() => console.log()} onDelete={() => console.log()} />
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