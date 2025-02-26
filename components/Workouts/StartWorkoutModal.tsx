import { View, Text, Modal, ScrollView } from 'react-native'
import React, { useState, useEffect} from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'

const StartWorkoutModal = ({ modalVisible, setModalVisible, workout }:
     {modalVisible: any, setModalVisible: any, workout: any}) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [loading, setLoading] = useState(false)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const cancelWorkout = () => {
    setModalVisible(!modalVisible)
  }
    return (
    <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            cancelWorkout()
        }}
        >
            <View className={`flex-col w-full h-full mt-14`}
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
            </View>
            <ScrollView>
                <View className='w-full'>
                    <Text></Text>
                </View>
            </ScrollView>
        </Modal>
  )
}

export default StartWorkoutModal