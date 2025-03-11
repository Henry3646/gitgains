import { View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { supabase } from '~/lib/supabase'
import { ChevronLeft } from 'lucide-react-native'
import { H2 } from '~/components/ui/typography'
import { router } from 'expo-router'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Text } from '~/components/ui/text'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import SwipeableRow from '~/components/SwipeableRow'
import ExerciseComponent from '~/components/Workouts/ExerciseComponent'
import StartWorkoutModal from '~/components/Workouts/StartWorkoutModal'

type Workout = {
  id: string
  name: string
  user_id: string
  muscle_groups: string[]
  total_sets: number
  desc: string
}


const ViewWorkout = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const { workoutId } = useLocalSearchParams()
  const [loading, setLoading] = useState(true)
  const [workout, setWorkout] = useState<Workout>()
  const [exercises, setExercises] = useState<any[]>([])
  const [showStartWorkoutModal, setShowStartWorkoutModal] = useState(false)
  const [completedWorkoutData, setCompletedWorkoutData] = useState<any>()

  const getWorkout = async (userId: string) => {
    // Fetch workout by workoutId
    setLoading(true)
    const { data, error } = await supabase
      .from('Workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', userId)

    if (error) {
      console.error(error)
      return
    }
    if (data) {
      setWorkout(data[0])
      getExercises()
    }
  } 

  const getExercises = async () => {
    const { data, error } = await supabase
      .from('Exercises')
      .select('*, Workout_Exercises!inner(exercise_id)')
      .eq('Workout_Exercises.workout_id', workoutId)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setExercises(data)
      setLoading(false)
    }
  }

  const handleStartWorkout = () => {
    // Start workout
    setShowStartWorkoutModal(true)
  }

  useEffect(() => {
    // Fetch workout by workoutId
    getCurrentUserId().then((userId) => {
      if (userId) {
        getWorkout(userId)
      }
    })
  }, [])
  return (
    <View className='h-full w-full mt-14 '>
      <StartWorkoutModal modalVisible={showStartWorkoutModal} setModalVisible={setShowStartWorkoutModal} workout={workout} exercises={exercises} />
      <View className='w-full flex-row items-center pt-4'>
        <TouchableOpacity onPress={() => router.back()} >
          <ChevronLeft size={30} color={theme.text} strokeWidth={2}/>
          </TouchableOpacity>
        <H2 className=' pt-2 w-full '>{workout?.name}</H2>
      </View>
      <ScrollView className='w-full h-full'>
      <View className='w-full p-8 pb-0'>
        {loading && <View className='w-full flex-col items-start gap-2'>
          <Skeleton className='w-[100%] h-[22px]' />
          <Skeleton className='w-[85%]  h-[22px]' />
          <Skeleton className='w-[90%]  h-[22px]' />
          <Skeleton className='w-[80%]  h-[22px]' />
          </View>}
          {!loading && <Text className='text-xl w-full flex-wrap'>{workout?.desc}</Text> }
          
      </View>
      <View className='w-full items-center p-5 mt-5'>
        {loading ?
          <View className='w-full flex-row items-center justify-around gap-2'>
            <Skeleton className='w-[27%] h-[30px] rounded-full' />
            <Skeleton className='w-[27%] h-[30px] rounded-full' />
            <Skeleton className='w-[27%] h-[30px] rounded-full' />
          </View>
        :
          <View className='w-full flex-row items-center justify-around gap-2'>
            {workout?.muscle_groups.map((group) => (
              <Badge className='w-[27%]  items-center justify-center'>
                <Text className='text-lg'>{group}</Text>
              </Badge>
              
            ))}
          </View>
        }
      </View>
      <View className='w-full item-center p-5 pb-0'>
        {loading ?
          <View className='w-full flex-row items-center justify-around gap-2'>
          <Skeleton className='w-[120px] h-[80px]' />
          <Skeleton className='w-[120px] h-[80px]' />
          </View>
          :
          <View className='w-full flex-row items-center justify-around gap-2'>
            <Card className='w-[120px] h-[80px] items-center justify-center' >
              <Text className='text-2xl'>{exercises.length}</Text>
              <Text className='text-lg font-bold'>Exercises</Text>
            </Card>
            <Card className='w-[120px] h-[80px] items-center justify-center' >
              <Text className='text-2xl'>{workout?.total_sets}</Text>
              <Text className='text-lg font-bold'>Total Sets</Text>
            </Card>
          </View>
        }
      </View>
      <H2 className='ml-[5%] pt-6'>Exercises</H2>
      <View className='w-full items-center pt-4'>
        {loading ?
          <View className='w-full flex-col items-center gap-2'>
            <Skeleton className='w-[90%] h-[140px]' />
            <Skeleton className='w-[90%] h-[140px]' />
            <Skeleton className='w-[90%] h-[140px]' />
          </View>
          : <>
            {exercises.map((exercise) => (
              <SwipeableRow key={exercise.id} children={<ExerciseComponent exercise={exercise} checked={false} editable={true}  />} onEdit={() => console.log()} onDelete={() => console.log()} />
            ))}
          </>
        }
      </View>
      <View className='h-[100px]' />
      </ScrollView>
      <View className='absolute bottom-16 items-center w-full'>
          <Button className='w-[90%] mt-4' onPress={handleStartWorkout}>
              <Text>Start Workout</Text>
          </Button>
      </View>
    </View>
  )
}

export default ViewWorkout