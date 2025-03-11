import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Text } from '~/components/ui/text'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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

const NewWorkout = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [refreshing, setRefreshing] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])
  const [addModal, setAddModal] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [addedExercise, setAddedExercise] = useState<any[]>([])
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

  const handleCreateWorkout = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return

      let muscleGroupCount: { [key: string]: number } = {}
      addedExercise.map((exercise) => {
        exercise.muscle_group.forEach((group: string) => {
          if (muscleGroupCount[group]) {
            muscleGroupCount[group] += 1
          } else {
            muscleGroupCount[group] = 1
          }
        })
      })
      /// top 3 muscle groups
      const muscleGroups = Object.keys(muscleGroupCount).sort((a, b) => muscleGroupCount[b] - muscleGroupCount[a]).slice(0, 3)
      let totalSets = 0

      addedExercise.forEach((exercise) => {
        totalSets += exercise.sets
      })

      const workout = {
        name: name,
        desc: description,
        muscle_groups: muscleGroups,
        total_sets: totalSets,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('Workouts')
        .insert(workout)
        .select('id')

      if (error) throw error

      if (data) {
        const workoutId = data[0].id
        addedExercise.forEach(async (exercise) => {
          const { data, error } = await supabase
            .from('Workout_Exercises')
            .insert([
              {
                workout_id: workoutId,
                exercise_id: exercise.id,
                sets: exercise.sets,
                reps: exercise.reps,
              }
            ])

          if (error) {
            console.error('Error inserting workout exercise:', error)
            return
          }
        })
      }

      router.replace('/(tabs)/(workouts)/Workout')
    } catch (error) {
      console.error('Error creating workout:', error)
    }
  }

  useEffect(() => {
    console.log(exercises)
  }, [exercises])

  return (
    <View className='w-full h-full mt-14'>
      <AddExerciseToWorkout modalVisible={addModal} setModalVisible={setAddModal} switchModal={openCreateModal} exercises={addedExercise} setExercises={setAddedExercise}/>
      <CreateExercise modalVisible={createModal} setModalVisible={setCreateModal} switchModal={closeCreateModal}/>
      <TouchableOpacity className='flex-row items-center pt-4' onPress={() => router.dismiss()}>
      <ChevronLeft size={30} color={theme.text} strokeWidth={2} />
      <H2 className='ml-[5%] pt-2'>New Workout</H2>
      </TouchableOpacity>
      <View className='w-full items-center'>
        <View className='w-[90%] mt-4'>
          <Label className='mb-2'>Name</Label>
          <Input placeholder='Workout Name' value={name} onChangeText={setName} />
        </View>
        <View className='w-[90%]'>
            <Label className='text-left mb-2 mt-2'>Description</Label>
          <Textarea placeholder='Description' value={description} onChangeText={setDescription} />
        </View>
      </View>
      <H2 className='pt-6 ml-[5%]'>Exercises</H2>
      <View className='w-full items-center'>
        <Button className='w-[90%] mt-4 mb-4' onPress={() => setAddModal(true)}>
            <Plus size={30} color={theme.background} strokeWidth={2}/>
        </Button>
        <ScrollView
            className='w-full h-[37%]'
            >
                <View className='flex-col w-full items-center h-[90%] '>
                    {addedExercise.length > 0 ?
                        <>
                        {addedExercise.map((exercise: any) => (
                            <ExerciseComponent key={exercise.id} exercise={exercise} checked={false} editable={true} />
                        ))}
                        </>
                        :
                        <Text>No exercises added yet...</Text>
                    }
                </View>
            </ScrollView>
      </View>
      <View className='absolute bottom-16 items-center w-full'>
          <Button className='w-[90%] mt-4' onPress={handleCreateWorkout}>
              <Text>Create Workout</Text>
          </Button>
      </View>
    </View>
  )
}

export default NewWorkout