import { View, Modal, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'
import AnimatedTimer from './AnimatedTimer'
import { H2 } from '~/components/ui/typography'
import { Text } from '~/components/ui/text'
import ExerciseCard from './ExerciseCard'
import { Button } from '~/components/ui/button'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { supabase } from '~/lib/supabase'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { TouchableOpacity } from 'react-native-gesture-handler'

interface Set {
  id: number;
  reps: number | null;
  weight: number | null;
}

interface Exercise {
  id: number;
  sets: Set[];
}

const StartWorkoutModal = ({ modalVisible, setModalVisible, workout, exercises }:
  { modalVisible: any, setModalVisible: any, workout: any, exercises: any }) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [status, setStatus] = useState('idle')
  const [startTime, setStartTime] = useState(new Date())
  const [exerciseData, setExerciseData] = useState<Exercise[]>([])

  const handleClose = () => {
    setModalVisible(false)
  }

  const handleStartWorkout = async () => {
    try {
      setLoading(true)
      const userId = await getCurrentUserId()
      if (!userId) return

      const totalWeight = exerciseData.reduce((acc: number, exercise: any) => {
        return acc + exercise.sets.reduce((setAcc: number, set: any) => {
          return setAcc + (set.reps || 0) * (set.weight || 0)
        }, 0)
      }, 0)

      const { data, error } = await supabase
        .from('Completed_Workouts')
        .insert({
          user_id: userId,
          calories_burnt: 0,
          total_time: currentTime,
          total_weight: totalWeight,
          num_exercises: exercises.length,
          workout_name: workout.name,
          workout_id: workout.id,
          start_time: startTime.toISOString(),
        })
        .select()
      
      if (error) throw error

      if (data) {
        await saveCompletedExercises(exerciseData, data[0].id)
        handleClose()
      }
    } catch (error) {
      console.error('Error completing workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCompletedExercises = async (exercisesData: any[], workoutId: any) => {
    const completedExercises = exercisesData.map(exerciseData => {
      const completedSets = exerciseData.sets.filter((set: any) => set.reps > 0).length
      const totalReps = exerciseData.sets.reduce((acc: number, set: any) => acc + (parseInt(set.reps) || 0), 0)
      const totalWeight = exerciseData.sets.reduce((acc: number, set: any) => 
        acc + (set.reps || 0) * (set.weight || 0), 0)
      const topSet = exerciseData.sets.reduce((acc: number, set: any) => 
        Math.max(acc, set.weight || 0), 0)
  
      return {
        exercise_id: exerciseData.id,
        completed_workout_id: workoutId,
        sets: completedSets,
        reps: totalReps,
        totalweight: totalWeight,
        topset: topSet
      }
    })

    const { error } = await supabase
      .from('Completed_Exercises')
      .insert(completedExercises)
  
    if (error) {
      console.error('Error inserting completed exercises:', error)
      return null
    }
  }

  const handleRepsChange = (eid: any, sid: any, value: any) => {
    setExerciseData(prev => prev.map(exercise => {
      if (exercise.id === eid) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === sid) {
              return { ...set, reps: value }
            }
            return set
          })
        }
      }
      return exercise
    }))
  }

  const handleWeightChange = (eid: any, sid: any, value: any) => {
    setExerciseData(prev => prev.map(exercise => {
      if (exercise.id === eid) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => {
            if (set.id === sid) {
              return { ...set, weight: value }
            }
            return set
          })
        }
      }
      return exercise
    }))
  }

  useEffect(() => {
    if (modalVisible) {
      const newExerciseData = exercises.map((exercise: any) => ({
        id: exercise.id,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          id: i,
          reps: null,
          weight: null
        }))
      }))
      setExerciseData(newExerciseData)
    }
  }, [modalVisible, exercises])

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View 
        className='flex-1'
        style={{ backgroundColor: theme.background }}
      >
        {/* Header */}
        <View className='flex-row justify-between items-center px-4 pt-16 pb-2'>
          <TouchableOpacity onPress={handleClose}>
            <X size={28} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          <H2 className='flex-1 text-center'>{workout?.name || 'Workout'}</H2>
          <View style={{ width: 28 }} /> {/* Spacer for alignment */}
        </View>

        {/* Timer */}
        <View className='px-4 py-2'>
          <AnimatedTimer 
            time={currentTime} 
            setTime={setCurrentTime} 
            onStop={handleStartWorkout}
            status={status} 
            setStatus={setStatus}
            setStartTime={setStartTime}
          />
        </View>

        {/* Exercise List */}
        <KeyboardAwareFlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className='px-4 py-2'>
              <ExerciseCard
                exercise={item}
                exerciseData={exerciseData.find((e: any) => e.id === item.id)} 
                handleRepChange={handleRepsChange} 
                handleWeightChange={handleWeightChange}
                status={status}
              />
            </View>
          )}
          enableOnAndroid={true}
          extraScrollHeight={Platform.select({ ios: 0, android: 25 })}
          keyboardOpeningTime={0}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableResetScrollToCoords={false}
        />

        {/* Bottom Action Button */}
        <View className='absolute bottom-0 left-0 right-0 px-4 py-8 bg-background border-t border-border'>
          <Button 
            className='w-full' 
            onPress={handleStartWorkout}
            disabled={loading || status === 'idle'}
          >
            <Text className='font-medium'>
              {loading ? 'Saving...' : 'Complete Workout'}
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  )
}

export default StartWorkoutModal