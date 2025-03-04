import { View, Text, Modal, ScrollView } from 'react-native'
import React, { useState, useEffect} from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'
import AnimatedTimer from './AnimatedTimer'
import { H2 } from '../ui/typography'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import ExerciseCard from './ExerciseCard'
import { FlatList } from 'react-native-gesture-handler'
import { Button } from '../ui/button'

const StartWorkoutModal = ({ modalVisible, setModalVisible, workout, exercises }:
     {modalVisible: any, setModalVisible: any, workout: any, exercises: any}) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [loading, setLoading] = useState(false)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const cancelWorkout = () => {
    setModalVisible(!modalVisible)
  }

  const completeWorkout = () => {
    console.log('Workout completed')
  }

  useEffect(() => {
    console.log('testin')
    console.log(exercises)
  }
  , [loading])
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
                <AnimatedTimer time={currentTime} setTime={setCurrentTime} onStop={completeWorkout} />       
                <H2 className='mb-4' />
                <FlatList
                    data={exercises}
                    renderItem={({ item }) => <ExerciseCard exercise={item} />}
                    keyExtractor={item => item.id}
                    className='mb-4'
                />
                <View className='px-6'>
                    <Button onPress={completeWorkout} >
                        <Text>Complete Workout</Text>
                    </Button>
                </View>

            </View>
        </Modal>
  )
}

export default StartWorkoutModal