import { View, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { ChevronLeft, X } from 'lucide-react-native'
import { H2 } from '~/components/ui/typography'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { supabase } from '~/lib/supabase'
import ToggleButton from '~/components/Workouts/ToggleButton'

const EditExercise = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const params = useLocalSearchParams()
  
  const [name, setName] = useState(params.exerciseName as string)
  const [sets, setSets] = useState(params.sets as string)
  const [reps, setReps] = useState(params.reps as string)
  const [rest, setRest] = useState(params.restTime as string)
  const [desc, setDesc] = useState(params.desc as string || '')
  const [muscleGroups, setMuscleGroups] = useState<string[]>(
    params.muscleGroups ? JSON.parse(params.muscleGroups as string) : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectButton = (name: string) => {
    if (muscleGroups.includes(name)) {
      setMuscleGroups(muscleGroups.filter((group) => group !== name))
    } else {
      setMuscleGroups([...muscleGroups, name])
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(params.exerciseId)
      // First, check if the exercise is part of any workouts
      const { data: workoutExercises, error: workoutExercisesError } = await supabase
        .from('Workout_Exercises')
        .select('workout_id, sets')
        .eq('exercise_id', params.exerciseId)

      if (workoutExercisesError) throw workoutExercisesError

      // If the exercise is not part of any workouts, update it directly]
      const { error: exerciseError } = await supabase
          .from('Exercises')
          .update({
            name,
            sets: parseInt(sets),
            reps: parseInt(reps),
            rest: parseInt(rest),
            desc: desc,
            muscle_group: muscleGroups
          })
          .eq('id', params.exerciseId)

        if (exerciseError) {
          console.log(exerciseError)
        }
      if (!workoutExercises || workoutExercises.length === 0) {
        console.log('no workouts')
      } else {
        // If the exercise is part of workouts, update all associated workouts
        const oldSets = parseInt(params.sets as string)
        const newSets = parseInt(sets)
        const setsDiff = newSets - oldSets

        // Update each workout's total sets
        for (const workoutExercise of workoutExercises) {
          const { data: workoutData, error: workoutFetchError } = await supabase
            .from('Workouts')
            .select('total_sets')
            .eq('id', workoutExercise.workout_id)
            .single()

          if (workoutFetchError) throw workoutFetchError

          const { error: workoutError } = await supabase
            .from('Workouts')
            .update({ 
              total_sets: workoutData.total_sets + setsDiff
            })
            .eq('id', workoutExercise.workout_id)

          if (workoutError) throw workoutError

          // Update the sets in Workout_Exercises
          const { error: workoutExerciseError } = await supabase
            .from('Workout_Exercises')
            .update({ sets: newSets })
            .eq('workout_id', workoutExercise.workout_id)
            .eq('exercise_id', params.exerciseId)

          if (workoutExerciseError) throw workoutExerciseError
        }
      }

      router.back()
    } catch (error) {
      console.error('Error updating exercise:', error)
      setError('Failed to update exercise')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View 
          className='flex-1 mt-14'
          style={{
            backgroundColor: theme.background,
          }}
        >
          <TouchableOpacity 
        className='flex-row items-start w-full' 
        onPress={() => router.back()}
      >
        <ChevronLeft size={30} color={theme.text} strokeWidth={2} />
        <View className='w-full'>
          <H2 className=''>Edit Exercise</H2>
        </View>
      </TouchableOpacity>

          <ScrollView 
            className='flex-1'
            showsVerticalScrollIndicator={false}
          >
            <View className='w-full items-center'>
              <View className='w-[90%] mt-4 mb-4'>
                <Label className='text-left mb-2'>Name</Label>
                <Input 
                  className='w-full' 
                  placeholder='Exercise Name' 
                  value={name} 
                  onChangeText={setName}
                />
              </View>

              <View className='flex-col w-[90%] items-center justify-between'>
                <View className='w-full mb-2'>
                  <Label className='text-left'>Muscle Groups</Label>
                </View>
                <View className='flex-row w-full items-center justify-between mb-4'>
                  <ToggleButton 
                    name='Chest' 
                    state={muscleGroups.includes('Chest')} 
                    setState={() => handleSelectButton('Chest')}
                  />
                  <ToggleButton 
                    name='Shoulders' 
                    state={muscleGroups.includes('Shoulders')} 
                    setState={() => handleSelectButton('Shoulders')}
                  />
                  <ToggleButton 
                    name='Back' 
                    state={muscleGroups.includes('Back')} 
                    setState={() => handleSelectButton('Back')}
                  />
                </View>
                <View className='flex-row w-full items-center justify-between mb-4'>
                  <ToggleButton 
                    name='Arms' 
                    state={muscleGroups.includes('Arms')} 
                    setState={() => handleSelectButton('Arms')}
                  />
                  <ToggleButton 
                    name='Legs' 
                    state={muscleGroups.includes('Legs')} 
                    setState={() => handleSelectButton('Legs')}
                  />
                  <ToggleButton 
                    name='Core' 
                    state={muscleGroups.includes('Core')} 
                    setState={() => handleSelectButton('Core')}
                  />
                </View>
              </View>

              <View className='w-[90%] flex-col'>
                <View className='flex-row items-center justify-between mb-4'>
                  <View className='w-[30%]'>
                    <Label className='text-left'>Sets</Label>
                    <Input 
                      placeholder='0' 
                      inputMode='decimal' 
                      value={sets} 
                      onChangeText={setSets} 
                    />
                  </View>
                  <View className='w-[30%]'>
                    <Label className='text-left'>Reps</Label>
                    <Input 
                      placeholder='0' 
                      inputMode='decimal' 
                      value={reps} 
                      onChangeText={setReps}
                    />
                  </View>
                  <View className='w-[30%]'>
                    <Label className='text-left'>Rest</Label>
                    <Input 
                      placeholder='0s' 
                      inputMode='decimal' 
                      value={rest} 
                      onChangeText={setRest}
                    />
                  </View>
                </View>
              </View>

              <View className='w-[90%]'>
                <Label className='text-left mb-2'>Description</Label>
                <Textarea 
                  placeholder='Description' 
                  value={desc} 
                  onChangeText={setDesc} 
                />
              </View>

              {error && (
                <Text className='text-red-500 text-center mt-4'>{error}</Text>
              )}
            </View>
          </ScrollView>

          <View className='items-center w-full pb-8'>
            <Button 
              className='w-[90%] mt-4' 
              onPress={handleSave}
              disabled={loading || !name || !sets || !reps || !rest}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <Text className='font-bold'>Save Changes</Text>
              )}
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default EditExercise 