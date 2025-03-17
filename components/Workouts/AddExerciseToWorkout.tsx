import { View, Modal, ScrollView, RefreshControl, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X, Search, Plus } from 'lucide-react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { supabase } from '~/lib/supabase'
import ExerciseComponent from './ExerciseComponent'
import { useFocusEffect } from 'expo-router'
import { H2 } from '~/components/ui/typography'

const AddExerciseToWorkout = ({modalVisible, setModalVisible, switchModal, exercises, setExercises}: {modalVisible: any, setModalVisible: any, switchModal: any, exercises: any, setExercises: any}) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [searchQuery, setSearchQuery] = useState('')
  const [allExercises, setAllExercises] = useState<any[]>([])
  const [filteredExercises, setFilteredExercises] = useState<any[]>([])
  const [selectedExercises, setSelectedExercises] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (modalVisible) {
      setSelectedExercises([...exercises])
    }
  }, [modalVisible, exercises])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExercises(allExercises)
    } else {
      const filtered = allExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredExercises(filtered)
    }
  }, [searchQuery, allExercises])

  const refreshExercises = async () => {
    setRefreshing(true)
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('Exercises')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) {
      console.error('Error fetching exercises:', error)
      return
    }

    if (data) {
      setAllExercises(data)
      setFilteredExercises(data)
    }
    setRefreshing(false)
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const handleCheck = (exercise: any) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(ex => ex.id === exercise.id)
      if (isSelected) {
        return prev.filter(ex => ex.id !== exercise.id)
      } else {
        return [...prev, exercise]
      }
    })
  }

  const handleDone = () => {
    setExercises(selectedExercises)
    setModalVisible(false)
    setSearchQuery('')
  }

  const handleClose = () => {
    setModalVisible(false)
    setSearchQuery('')
  }

  useEffect(() => {
    if (modalVisible) {
      refreshExercises()
    }
  }, [modalVisible])

  useFocusEffect(
    useCallback(() => {
      if (modalVisible) {
        refreshExercises()
      }
    }, [modalVisible])
  )

  return (
    <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onShow={() => refreshExercises()}
        onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View 
          className='flex-1 bg-background'
          style={{
            backgroundColor: theme.background,
          }}
        >
          {/* Header */}
          <View className='flex-row justify-between items-center px-4 pt-16 pb-2'>
            <TouchableOpacity onPress={handleClose}>
              <X size={28} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            <H2 className='flex-1 text-center'>Add Exercises</H2>
            <View style={{ width: 28 }} /> {/* Spacer for alignment */}
          </View>

          {/* Search Bar */}
          <View className='px-4 py-3'>
            <View className='flex-row items-center bg-muted rounded-lg px-3 py-2'>
              <Search size={20} color={theme.text} strokeWidth={2} />
              <Input 
                className='flex-1 ml-2 border-0 bg-transparent' 
                placeholder='Search exercises...' 
                value={searchQuery} 
                onChangeText={handleSearch}
              />
            </View>
          </View>

          {/* Create New Exercise Button */}
          <View className='px-4 py-2'>
            <Button 
              className='w-full flex-row justify-center items-center gap-2' 
              variant="outline"
              onPress={switchModal}
            >
              <Plus size={20} color={theme.text} strokeWidth={2} />
              <Text>Create New Exercise</Text>
            </Button>
          </View>

          {/* Exercise List */}
          <ScrollView
            className='flex-1 px-4'
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshExercises}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <View className='gap-3 pb-32'>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => {
                  const index = selectedExercises.findIndex(ex => ex.id === exercise.id)
                  return (
                    <TouchableOpacity 
                      key={exercise.id} 
                      onPress={() => handleCheck(exercise)} 
                      className='w-full'
                    >
                      <ExerciseComponent 
                        exercise={exercise} 
                        checked={index !== -1}
                        editable={false}
                        orderNumber={index !== -1 ? index + 1 : undefined}
                      />
                    </TouchableOpacity>
                  )
                })
              ) : (
                <View className='flex-1 items-center justify-center py-8'>
                  <Text className='text-muted-foreground'>No exercises found</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <View className='absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border'>
            <Button 
              className='w-full' 
              onPress={handleDone}
              disabled={selectedExercises.length === 0}
            >
              <Text className='font-medium'>
                Add {selectedExercises.length} {selectedExercises.length === 1 ? 'Exercise' : 'Exercises'}
              </Text>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default AddExerciseToWorkout