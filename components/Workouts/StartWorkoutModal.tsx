import { View, Text, Modal, ScrollView, Platform } from 'react-native'
import React, { useState, useEffect} from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'
import AnimatedTimer from './AnimatedTimer'
import { H2 } from '../ui/typography'
import { Text as TextUI } from '../ui/text'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import ExerciseCard from './ExerciseCard'
import { FlatList } from 'react-native-gesture-handler'
import { Button } from '../ui/button'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { supabase } from '~/lib/supabase'

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
     {modalVisible: any, setModalVisible: any, workout: any, exercises: any}) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [status, setStatus] = useState('idle')
  const [startTime, setStartTime] = useState(new Date())
  const [exerciseData, setExerciseData] = useState<Exercise[]>([])

  const cancelWorkout = () => {
    setModalVisible(!modalVisible)
  }

  const completeWorkout = () => {
    const saveCompletedWorkout = async () => {
        const totalWeight = exerciseData.reduce((acc: number, exercise: any) => {
            return acc + exercise.sets.reduce((acc: number, set: any) => {
                return acc + (set.reps || 0) * (set.weight || 0)
            }, 0)
        }, 0)
        const completedWorkout = {
            calories_burnt: 0,
            total_time: currentTime,
            total_weight: totalWeight,
            num_exercises: exercises.length,
            workout_name: workout.name,
            workout_id: workout.id,
            user_id: 'e9cac5f4-62df-46bd-afc4-08d89aba2f51',
            start_time: startTime.toISOString(),
        }
    
        const { data, error } = await supabase
            .from('Completed_Workouts')
            .insert([completedWorkout])
            .select()
            .single()
        if (error) {
            console.error('Error inserting completed workout:', error)
        }
        if (data) {
            console.log('Completed workout inserted:', data)
            saveCompletedExercises(exerciseData, data.id)
        }
    }

    const saveCompletedExercises = async (exercisesData: any[], workoutId: any) => {
        // Process all exercises and prepare for batch insert
        const completedExercises = exercisesData.map(exerciseData => {
          const completedSets = exerciseData.sets.filter((set: any) => set.reps > 0).length;
          const totalReps = exerciseData.sets.reduce((acc: number, set: any) => acc + (parseInt(set.reps) || 0), 0);
          const totalWeight = exerciseData.sets.reduce((acc: number, set: any) => 
            acc + (set.reps || 0) * (set.weight || 0), 0);
          const topSet = exerciseData.sets.reduce((acc: number, set: any) => 
            Math.max(acc, set.weight || 0), 0);
      
          return {
            exercise_id: exerciseData.id,
            completed_workout_id: workoutId,
            sets: completedSets,
            reps: totalReps,
            totalweight: totalWeight,
            topset: topSet
          };
        });
        console.log(completedExercises)
        // Batch insert all exercises
        const { data, error } = await supabase
          .from('Completed_Exercises')
          .insert(completedExercises)
          .select();
      
        if (error) {
          console.error('Error inserting completed exercises:', error);
          return null;
        }
      
        console.log('Completed exercises inserted:', data);
        return data;
      };

    saveCompletedWorkout()
  }

  const handleRepsChange = (eid: any, sid: any, value: any) => {
    const newExerciseData = exerciseData.map((exercise: any) => {
        if (exercise.id === eid) {
            const newSets = exercise.sets.map((set: any) => {
                if (set.id === sid) {
                    return {
                        ...set,
                        reps: value
                    }
                }
                return set
            })
            return {
                ...exercise,
                sets: newSets
            }
        }
        return exercise
    })
        setExerciseData(newExerciseData)
    }

    const handleWeightChange = (eid: any, sid: any, value: any) => {
        const newExerciseData = exerciseData.map((exercise: any) => {
            if (exercise.id === eid) {
                const newSets = exercise.sets.map((set: any) => {
                    if (set.id === sid) {
                        return {
                            ...set,
                            weight: value
                        }
                    }
                    return set
                })
                return {
                    ...exercise,
                    sets: newSets
                }
            }
            return exercise
        })
        setExerciseData(newExerciseData)
    }

  useEffect(() => {
    //initializes exerciseData array with n rows for n exercises, where each row has x rows for x sets, each row for sets has reps and weight
    const newExerciseData = (exercises.map((exercise: any) => {
        return {
            id: exercise.id,
            sets: Array.from({length: exercise.sets}, (_, i) => {
                return {
                    id: i,
                    reps: null,
                    weight: null
                }
            })
        }
    }))
    setExerciseData(newExerciseData)
  }, [modalVisible])

    return (
    <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            cancelWorkout()
        }}
        >
            <View className={`flex-col w-full h-full mt-14 pb-24`}
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
                <AnimatedTimer 
                    time={currentTime} 
                    setTime={setCurrentTime} 
                    onStop={completeWorkout} 
                    status={status} 
                    setStatus={setStatus}
                    setStartTime={setStartTime} />       
                <H2 className='mb-4' />
                <KeyboardAwareFlatList
                    data={exercises}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <ExerciseCard
                        exercise={item}
                        exerciseData={exerciseData.find((exercise: any) => exercise.id === item.id)} 
                        handleRepChange={handleRepsChange} 
                        handleWeightChange={handleWeightChange}
                        status={status} 
                      />
                    )}
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.select({ ios: 0, android: 25 })}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    enableResetScrollToCoords={false}
                />
                <View className='px-6'>
                    <Button onPress={completeWorkout} >
                        <TextUI>Complete Workout</TextUI>
                    </Button>
                </View>

            </View>
        </Modal>
  )
}

export default StartWorkoutModal