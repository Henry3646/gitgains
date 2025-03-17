import { View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { supabase } from '~/lib/supabase'
import { ChevronLeft } from 'lucide-react-native'
import { H2 } from '~/components/ui/typography'
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

// Types
interface Workout {
  id: string;
  name: string;
  user_id: string;
  muscle_groups: string[];
  total_sets: number;
  desc: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  muscle_group: string[];
  desc: string;
  [key: string]: any;
}

const ViewWorkout = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const { workoutId } = useLocalSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showStartWorkoutModal, setShowStartWorkoutModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const getWorkout = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Workouts')
        .select('*')
        .eq('id', workoutId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Workout not found')

      setWorkout(data)
      await getExercises()
    } catch (error) {
      console.error('Error fetching workout:', error)
      setError('Failed to load workout details')
    }
  }, [workoutId])

  const getExercises = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('Exercises')
        .select('*, Workout_Exercises!inner(exercise_id)')
        .eq('Workout_Exercises.workout_id', workoutId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setExercises(data || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setError('Failed to load exercises')
    }
  }, [workoutId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    const userId = await getCurrentUserId()
    if (userId) {
      await getWorkout(userId)
    }
    setRefreshing(false)
  }, [getWorkout])

  const handleStartWorkout = useCallback(() => {
    setShowStartWorkoutModal(true)
  }, [])

  const handleDeleteExercise = useCallback(async (exerciseId: string) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise? This action cannot be undone.",
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
              setLoading(true)
              const { error } = await supabase
                .from('Workout_Exercises')
                .delete()
                .eq('workout_id', workoutId)
                .eq('exercise_id', exerciseId)

              if (error) throw error

              // Refresh exercises list
              await getExercises()
              
              // Update total sets in workout
              if (workout) {
                const exerciseToDelete = exercises.find(e => e.id === exerciseId)
                const setsToRemove = exerciseToDelete?.sets || 0
                
                const { error: updateError } = await supabase
                  .from('Workouts')
                  .update({ 
                    total_sets: workout.total_sets - setsToRemove
                  })
                  .eq('id', workoutId)

                if (updateError) throw updateError
                
                // Refresh workout data
                const userId = await getCurrentUserId()
                if (userId) {
                  await getWorkout(userId)
                }
              }
            } catch (error) {
              console.error('Error deleting exercise:', error)
              setError('Failed to delete exercise')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }, [workoutId, workout, exercises])

  const handleEditExercise = useCallback((exercise: Exercise) => {
    router.push({
      pathname: "/EditExercise",
      params: { 
        workoutId,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: exercise.sets.toString(),
        reps: exercise.reps.toString(),
        restTime: exercise.rest ? exercise.rest.toString() : '',
        desc: exercise.desc || ''
      }
    })
  }, [workoutId])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const userId = await getCurrentUserId()
        if (!userId) throw new Error('User not authenticated')
        await getWorkout(userId)
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load workout')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [getWorkout])

  const renderMuscleGroups = () => (
    <View className='w-full flex-row items-center justify-around flex-wrap gap-2 px-2'>
      {workout?.muscle_groups.map((group, index) => (
        <Badge 
          key={index} 
          className='min-w-[27%] items-center justify-center mb-2'
        >
          <Text className='text-lg capitalize'>{group}</Text>
        </Badge>
      ))}
    </View>
  )

  const renderStats = () => (
    <View className='w-full flex-row items-center justify-around gap-4 px-4'>
      <Card className='flex-1 h-[80px] items-center justify-center'>
        <Text className='text-2xl font-bold'>{exercises.length}</Text>
        <Text className='text-sm'>Exercises</Text>
      </Card>
      <Card className='flex-1 h-[80px] items-center justify-center'>
        <Text className='text-2xl font-bold'>{workout?.total_sets}</Text>
        <Text className='text-sm'>Total Sets</Text>
      </Card>
    </View>
  )

  if (error) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Text className='text-red-500 text-center mb-4'>{error}</Text>
        <Button onPress={handleRefresh}>
          <Text>Try Again</Text>
        </Button>
      </View>
    )
  }

  return (
    <View className='flex-1 '>
      <StartWorkoutModal 
        modalVisible={showStartWorkoutModal} 
        setModalVisible={setShowStartWorkoutModal} 
        workout={workout} 
        exercises={exercises}
      />

      <View className='flex-row items-center pt-16 pb-2'>
        <TouchableOpacity 
          onPress={() => router.back()}
          className='flex-row items-start'
        >
          <ChevronLeft size={28} color={theme.text} />
          <H2 className='flex-1'>{workout?.name || 'Loading...'}</H2>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <View className='p-4'>
          {loading ? (
            <View className='gap-2'>
              <Skeleton className='w-full h-[22px]' />
              <Skeleton className='w-[85%] h-[22px]' />
              <Skeleton className='w-[90%] h-[22px]' />
            </View>
          ) : (
            <Text className='text-lg'>{workout?.desc}</Text>
          )}
        </View>

        <View className='mt-2 mb-4'>
          {loading ? (
            <View className='flex-row justify-around px-4'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='w-[27%] h-[36px] rounded-full' />
              ))}
            </View>
          ) : (
            renderMuscleGroups()
          )}
        </View>

        <View className='mb-6'>
          {loading ? (
            <View className='flex-row justify-around px-4'>
              <Skeleton className='w-[45%] h-[80px]' />
              <Skeleton className='w-[45%] h-[80px]' />
            </View>
          ) : (
            renderStats()
          )}
        </View>

        <View className='px-4'>
          <H2 className='mb-4'>Exercises</H2>
          {loading ? (
            <View className='gap-3'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='w-full h-[120px]' />
              ))}
            </View>
          ) : exercises.length === 0 ? (
            <Text className='text-center text-gray-500 py-4'>
              No exercises added to this workout yet
            </Text>
          ) : (
            <View className='gap-3 pb-24'>
              {exercises.map((exercise) => (
                <SwipeableRow
                  key={exercise.id}
                  onEdit={() => handleEditExercise(exercise)}
                  onDelete={() => handleDeleteExercise(exercise.id)}
                >
                  <ExerciseComponent
                    exercise={exercise}
                    checked={false}
                    editable={true}
                  />
                </SwipeableRow>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View className='absolute bottom-4 w-full px-4'>
        <Button
          className='w-full'
          onPress={handleStartWorkout}
          disabled={loading || exercises.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text className='font-bold'>
              {exercises.length === 0 ? 'Add Exercises to Start' : 'Start Workout'}
            </Text>
          )}
        </Button>
      </View>
    </View>
  )
}

export default ViewWorkout