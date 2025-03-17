import { View, ScrollView, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { H2 } from '~/components/ui/typography'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { supabase } from '~/lib/supabase'
import { ChevronLeft, Plus, X } from 'lucide-react-native'
import SwipeableRow from '~/components/SwipeableRow'
import CreateExercise from '~/components/Workouts/CreateExercise'
import AddExerciseToWorkout from '~/components/Workouts/AddExerciseToWorkout'
import { Textarea } from '~/components/ui/textarea'
import ExerciseComponent from '~/components/Workouts/ExerciseComponent'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
  desc: string | null
}

const EditWorkout = () => {
  const { workoutId } = useLocalSearchParams()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [exercisesToRemove, setExercisesToRemove] = useState<string[]>([])

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        // Fetch workout details
        const { data: workoutData, error: workoutError } = await supabase
          .from('Workouts')
          .select('*')
          .eq('id', workoutId)
          .single()

        if (workoutError) throw workoutError

        setName(workoutData.name)
        setDesc(workoutData.desc || '')

        // Fetch workout exercises with their details
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('Exercises')
          .select('*, Workout_Exercises!inner(exercise_id)')
          .eq('Workout_Exercises.workout_id', workoutId)

        if (exercisesError) throw exercisesError

        setExercises(exercisesData)
      } catch (error) {
        console.error('Error fetching workout details:', error)
        Alert.alert('Error', 'Failed to load workout details')
      }
    }

    fetchWorkoutDetails()
  }, [workoutId])

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a workout name')
      return
    }

    setLoading(true)
    try {
      // Update workout details
      const { error: updateError } = await supabase
        .from('Workouts')
        .update({
          name: name.trim(),
          desc: desc.trim() || null,
          updated_at: new Date().toISOString(),
          total_sets: exercises.reduce((total, exercise) => total + exercise.sets, 0),
        })
        .eq('id', workoutId)

      if (updateError) throw updateError

      // Delete existing exercise associations
      const { error: deleteError } = await supabase
        .from('Workout_Exercises')
        .delete()
        .eq('workout_id', workoutId)

      if (deleteError) throw deleteError

      // Add updated exercise associations
      if (exercises.length > 0) {
        const { error: exercisesError } = await supabase
          .from('Workout_Exercises')
          .insert(
            exercises.map(exercise => ({
              workout_id: workoutId,
              exercise_id: exercise.id,
              sets: exercise.sets,
              reps: exercise.reps,
            }))
          )

        if (exercisesError) throw exercisesError
      }

      if (exercisesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('Workout_Exercises')
          .delete()
          .in('exercise_id', exercisesToRemove)
          .eq('workout_id', workoutId)

        if (deleteError) throw deleteError
      }

      router.back()
    } catch (error) {
      console.error('Error updating workout:', error)
      Alert.alert('Error', 'Failed to update workout')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId))
    setExercisesToRemove(prev => [...prev, exerciseId])
  }

  const handleEditExercise = (exercise: Exercise) => {
    router.push({
      pathname: '/EditExercise',
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
  }


  const openCreateModal = () => {
    setAddModal(false)
    setCreateModal(true)
  }

  const closeCreateModal = () => {
    setCreateModal(false)
    setAddModal(true)
  }

 

  return (
    <View className='w-full flex-1 pt-16 items-center'>
      <AddExerciseToWorkout 
        modalVisible={addModal} 
        setModalVisible={setAddModal} 
        switchModal={openCreateModal}
        exercises={exercises}
        setExercises={setExercises}
      />
      <CreateExercise 
        modalVisible={createModal} 
        setModalVisible={setCreateModal} 
        switchModal={closeCreateModal}
      />
      <TouchableOpacity 
        className='flex-row items-start w-full' 
        onPress={() => router.back()}
      >
        <ChevronLeft size={30} color={theme.text} strokeWidth={2} />
        <View className='w-full'>
          <H2 className=''>Edit Workout</H2>
        </View>
      </TouchableOpacity>
      <ScrollView className='w-full px-4' showsVerticalScrollIndicator={false}>
        <View className='w-full mt-4'>
          <Label className='mb-2'>Name</Label>
          <Input 
            placeholder='Workout Name' 
            value={name} 
            onChangeText={setName} 
          />
        </View>
        <View className='w-full'>
          <Label className='text-left mb-2 mt-2'>Description</Label>
          <Textarea 
            placeholder='Description' 
            value={desc} 
            onChangeText={setDesc} 
          />
        </View>

        <View className='w-full'>
          <H2 className='pt-2'>Exercises</H2>
        </View>

        <Button 
          className='w-full flex-row justify-center items-center gap-2 my-4' 
          variant="outline" 
          onPress={() => setAddModal(true)}
        >
          <Plus size={20} color={theme.text} strokeWidth={2} />
          <Text>Add Exercise</Text>
        </Button>

        <View className='pb-20'>
          {exercises.map((exercise) => (
            <SwipeableRow
              key={exercise.id}
              onDelete={() => handleRemoveExercise(exercise.id)}
              onEdit={() => handleEditExercise(exercise)}
            >
              <ExerciseComponent
                exercise={exercise}
                checked={false}
                editable={true}
              />
            </SwipeableRow>
          ))}
        </View>
      </ScrollView>
      <View className='absolute bottom-4 items-center w-full px-4'>
        <Button 
          className='w-full mt-4'
          onPress={handleSave}
          disabled={loading}
        >
          <Text>Save Changes</Text>
        </Button>
      </View>
    </View>
  )
}

export default EditWorkout 