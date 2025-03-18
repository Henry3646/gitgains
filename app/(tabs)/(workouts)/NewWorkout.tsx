import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Text } from '~/components/ui/text'
import { H1, H2 } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Plus, ChevronLeft } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import SavedExercise from '~/components/Workouts/SavedExercise'
import AddExerciseToWorkout from '~/components/Workouts/AddExerciseToWorkout'
import CreateExercise from '~/components/Workouts/CreateExercise'
import ExerciseComponent from '~/components/Workouts/ExerciseComponent'
import { Textarea } from '~/components/ui/textarea'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { supabase } from '~/lib/supabase'
import { router } from 'expo-router'
import SwipeableRow from '~/components/SwipeableRow'
import { Exercise } from '~/types/exercise'

const NewWorkout = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [refreshing, setRefreshing] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [addedExercises, setAddedExercises] = useState<Exercise[]>([])
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')

  const openCreateModal = () => {
    setAddModal(false)
    setCreateModal(true)
  }

  const closeCreateModal = () => {
    setCreateModal(false)
    setAddModal(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    router.push({
      pathname: "/EditExercise",
      params: { 
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: exercise.sets?.toString() || '0',
        reps: exercise.reps?.toString() || '0',
        rest: exercise.rest?.toString() || '0',
        desc: exercise.desc || '',
        muscleGroup: exercise.muscle_group || ''
      }
    })
  }

  const handleDeleteExercise = (exerciseId: string) => {
    setAddedExercises(prev => prev.filter(ex => ex.id !== exerciseId))
  }

  const handleCreateWorkout = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return

      let muscleGroupCount: { [key: string]: number } = {}
      addedExercises.forEach((exercise) => {
        if (exercise.muscle_group) {
          const groups = Array.isArray(exercise.muscle_group) 
            ? exercise.muscle_group 
            : [exercise.muscle_group]
          groups.forEach((group: string) => {
            muscleGroupCount[group] = (muscleGroupCount[group] || 0) + 1
          })
        }
      })

      const muscleGroups = Object.keys(muscleGroupCount)
        .sort((a, b) => muscleGroupCount[b] - muscleGroupCount[a])
        .slice(0, 3)

      const totalSets = addedExercises.reduce((total, exercise) => total + exercise.sets, 0)

      const workout = {
        name,
        desc: description,
        muscle_groups: muscleGroups,
        total_sets: totalSets,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('Workouts')
        .insert(workout)
        .select('id')
        .single()

      if (error) throw error

      if (data) {
        const workoutExercises = addedExercises.map(exercise => ({
          workout_id: data.id,
          exercise_id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          user_id: userId
        }))

        const { error: exercisesError } = await supabase
          .from('Workout_Exercises')
          .insert(workoutExercises)

        if (exercisesError) throw exercisesError
      }

      router.replace('/(tabs)/(workouts)/Workout')
    } catch (error) {
      console.error('Error creating workout:', error)
    }
  }
  useEffect(() => {
    console.log('addedExercises')
    console.log(addedExercises)
  }, [addedExercises])
  return (
    <View className='w-full h-full pt-16 px-4 items-center'>
      <AddExerciseToWorkout 
        modalVisible={addModal} 
        setModalVisible={setAddModal} 
        switchModal={openCreateModal} 
        exercises={addedExercises} 
        setExercises={setAddedExercises}
      />
      <CreateExercise 
        modalVisible={createModal} 
        setModalVisible={setCreateModal} 
        switchModal={closeCreateModal}
      />
      
      <TouchableOpacity 
        className='flex-row items-start' 
        onPress={() => router.dismiss()}
      >
        <ChevronLeft size={30} color={theme.text} strokeWidth={2} />
        <View className='w-full'>
          <H2 className=''>New Workout</H2>
        </View>
      </TouchableOpacity>

      <ScrollView className='w-full flex-1' showsVerticalScrollIndicator={false}>
        <View className='w-full items-center'>
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
              value={description} 
              onChangeText={setDescription} 
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

          <View className='w-full  pb-32'>
            {addedExercises.length > 0 ? (
              addedExercises.map((exercise) => (
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
              ))
            ) : (
              <Text>No exercises added yet...</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View className='absolute bottom-4 items-center w-full'>
        <Button 
          className='w-full mt-4' 
          onPress={handleCreateWorkout}
          disabled={!name || addedExercises.length === 0}
        >
          <Text>Create Workout</Text>
        </Button>
      </View>
    </View>
  )
}

export default NewWorkout