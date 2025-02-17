import { View, Modal, ScrollView, RefreshControl, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'
import { Button } from '~/components/ui/button'
import { Search } from 'lucide-react-native'
import { Input } from '~/components/ui/input'
import { Plus } from 'lucide-react-native'
import { Separator } from '../ui/separator'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { supabase } from '~/lib/supabase'
import ExerciseComponent from './ExerciseComponent'
import { useFocusEffect } from 'expo-router'

const AddExerciseToWorkout = ({modalVisible, setModalVisible, switchModal, exercises, setExercises}: {modalVisible: any, setModalVisible: any, switchModal: any, exercises: any, setExercises: any}) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [searchQuery, setSearchQuery] = useState('')
  const [allExercises, setAllExercises] = useState<any[]>([])
  const [filteredExercises, setFilteredExercises] = useState<any[]>([])
  const [selectedExercises, setSelectedExercises] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const refreshExercises = async () => {
    setRefreshing(true)
    // const userId = await getCurrentUserId()
    const userId = 'e9cac5f4-62df-46bd-afc4-08d89aba2f51'
    const { data, error } = await supabase
      .from('Exercises')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching exercises:', error)
      return
    }

    if (data) {
      
      setFilteredExercises(data.filter((exercise) => exercise.name.includes(searchQuery)))
    }
    // setSelectedExercises(exercises)
    //   handleSearch(searchQuery)
    setRefreshing(false)
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    console.log(text)
    const filteredExercisesArray = allExercises.filter((exercise) => exercise.name.includes(text))
    console.log('array', filteredExercisesArray)
    setFilteredExercises(filteredExercisesArray)
    
  }

  const getExercises = async (userId: string) => {
    console.log('getting exercises')
    const { data, error } = await supabase
      .from('Exercises')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching exercises:', error)
      return
    }

    if (data) {
      setAllExercises(data)
      setFilteredExercises(data)
      setSelectedExercises(selectedExercises)
    }
  }
  
  const handleCheck = (exercise: any) => {
    if (selectedExercises.includes(exercise)) {
        console.log('removing ', exercise.name)
        const newExercises = selectedExercises.filter((ex: any) => ex !== exercise)
        setSelectedExercises(newExercises)
    } else {
        console.log('adding', exercise.name)
        const newExercises = [...selectedExercises, exercise]
        setSelectedExercises(newExercises)
    }
  }

  const handleDone = () => {
    setExercises(selectedExercises)
    setSearchQuery('')
    setModalVisible(!modalVisible)
  }

  const handleClose = () => {
    setSelectedExercises(exercises)
    setSearchQuery('')
    setModalVisible(!modalVisible)
  }

  useEffect(() => {
    getCurrentUserId().then((userId) => {
        getExercises('e9cac5f4-62df-46bd-afc4-08d89aba2f51')
    })
    }, []) 

  useEffect(() => {
    setSelectedExercises(exercises)
  }, [filteredExercises])
    
    useFocusEffect(
        useCallback(() => {
          console.log('useFocusEffect')
          refreshExercises()
          setSearchQuery('')
        }, [])
      )

  return (
    <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onShow={() => refreshExercises()}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
    >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className='w-full h-full flex-col mt-14'
            style={{
                backgroundColor: theme.background,
            }}
        >
            <X 
                size={40} 
                color={theme.text} 
                strokeWidth={1.5} 
                onPress={handleClose} 
                style={{
                    marginLeft: '3%'
                }} 
                
            />
            <View className='w-full ml-[4.5%] mt-5 flex-row items-center'>
                <Search size={30} color={theme.text} strokeWidth={2}/>
                <Input className='w-[78%] ml-[5%]' placeholder='Search...' value={searchQuery} onChangeText={(text) => handleSearch(text)} />
            </View>
            <View className='w-full items-center'>
                <Separator className='my-6 w-[90%]' />
            </View>
            <View className='w-full items-center'>
                <Button className='w-[90%]' onPress={() => switchModal()}>
                    <Plus size={30} color={theme.background} strokeWidth={2}/>
                </Button>    
            </View>
            <View className='w-full items-center'>
                <Separator className='my-6 w-[90%]' />
            </View>
            <ScrollView
                className='w-full h-[30%]'
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshExercises}
                    />
                }
            >
                <View className='flex-col w-full items-center h-[90%] '>
                    {filteredExercises.length > 0 ?
                        <View className='w-[90%] gap-4'>
                        {filteredExercises.map((exercise) => (
                            <TouchableOpacity key={exercise.id} onPress={() => handleCheck(exercise)} className='w-full items-center'>
                                <ExerciseComponent  exercise={exercise} checked={selectedExercises} editable={false}/>
                            </TouchableOpacity>
                        ))}
                        </View>
                        :
                        <Text>No exercises found...</Text>
                    }
                </View>
                <View className='h-[125px]' />
            </ScrollView>
            <View className='absolute bottom-24 items-center w-full'>
            <Button className='w-[90%] mt-4' onPress={handleDone}>
                <Text>Done</Text>
            </Button>
        </View>
        </View>
        
        </TouchableWithoutFeedback>
    </Modal>
  )
}

export default AddExerciseToWorkout