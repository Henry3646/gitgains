import { View, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { X } from 'lucide-react-native'
import { Button } from '~/components/ui/button'
import { H2 } from '~/components/ui/typography'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import ToggleButton from '~/components/Workouts/ToggleButton'
import { Textarea } from '~/components/ui/textarea'
import { supabase } from '~/lib/supabase'
import getCurrentUserId from '~/lib/getCurrentUserId'

const CreateExercise = ({modalVisible, setModalVisible, switchModal}: {modalVisible: any, setModalVisible: any, switchModal: any}) => {
    const { isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    const [muscleGroups, setMuscleGroups] = useState<any[]>([])
    const [name, setName] = useState('')
    const [reps, setReps] = useState('')
    const [sets, setSets] = useState('')
    const [rest, setRest] = useState('')
    const [description, setDescription] = useState('')


    const handleSelectButton = (name: string) => {
        if (muscleGroups.includes(name)) {
            setMuscleGroups(muscleGroups.filter((group) => group !== name))
        } else {
            setMuscleGroups([...muscleGroups, name])
        }
    }

    const handleCreateExercise = async () => {
        const insertExercise = async (userId: any) => {
        const { data, error } = await supabase
            .from('Exercises')
            .insert([
                {
                    name: name,
                    muscle_group: muscleGroups,
                    reps: parseInt(reps),
                    sets: parseInt(sets),
                    rest: parseInt(rest),
                    desc: description,
                    // user_id: userId
                    user_id: 'e9cac5f4-62df-46bd-afc4-08d89aba2f51'
                }
            ])
            .select()

            if (error) {
                console.error('Error inserting exercise:', error)
            }
            if (data) {
                console.log(data)
                setName('')
                setReps('')
                setSets('')
                setRest('')
                setDescription('')
                setMuscleGroups([])
                switchModal()
            }
        }
        getCurrentUserId().then((userId) => insertExercise(userId))
    }
    
    useEffect(() => {
        console.log(muscleGroups)
    }, [muscleGroups])
  return (
    <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible)
            }}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className='w-full h-full flex-col mt-14 '
            style={{
                backgroundColor: theme.background,
            }}
        >
            <X 
                size={40} 
                color={theme.text} 
                strokeWidth={1} 
                onPress={() => switchModal()} 
                style={{
                    marginLeft: '3%'
                }} 
                
            />
            <H2 className='ml-[4.5%]'>New Exercise</H2>
            <View className='w-full items-center'>
                <View className='w-[90%] mt-4 mb-4'>
                    <Label className='text-left mb-2'>Name</Label>
                    <Input className='w-full' placeholder='Exercise Name' value={name} onChangeText={setName}/>
                </View>
                <View className='flex-col w-[90%] items-center justify-between'>
                    <View className='w-full mb-2'>
                        <Label className='text-left'>Muscle Groups</Label>
                    </View>
                        <View className='flex-row w-full items-center justify-between mb-4'>
                            <ToggleButton name='Chest' state={[]} setState={() => handleSelectButton('Chest')}/>
                            <ToggleButton name='Shoulders' state={[]} setState={() => handleSelectButton('Shoulders')}/>
                            <ToggleButton name='Back' state={[]} setState={() => handleSelectButton('Back')}/>
                        </View>
                        <View className='flex-row w-full items-center justify-between mb-4'>
                            <ToggleButton name='Arms' state={[]} setState={() => handleSelectButton('Arms')}/>
                            <ToggleButton name='Legs' state={[]} setState={() => handleSelectButton('Legs')}/>
                            <ToggleButton name='Core' state={[]} setState={() => handleSelectButton('Core')}/>
                        </View>
                </View>
                <View className='w-[90%] flex-col'>
                    <View className='flex-row items-center justify-between mb-4'>
                        <View className='w-[30%]'>
                            <Label className='text-left'>Sets</Label>
                            <Input placeholder='0' inputMode='decimal' value={sets} onChangeText={setSets} />
                        </View>
                        <View className='w-[30%]'>
                            <Label className='text-left'>Reps</Label>
                            <Input placeholder='0' inputMode='decimal' value={reps} onChangeText={setReps}/>
                        </View>
                        <View className='w-[30%]'>
                            <Label className='text-left'>Rest</Label>
                            <Input placeholder='0s' inputMode='decimal' value={rest} onChangeText={setRest}/>
                        </View>
                    </View>
                </View>
                <View className='w-[90%]'>
                    <Label className='text-left mb-2'>Description</Label>
                    <Textarea placeholder='Description' value={description} onChangeText={setDescription} />
                </View>
            </View>
            <View className='absolute bottom-36 items-center w-full'>
                <Button className='w-[90%] mt-4' onPress={handleCreateExercise}>
                    <Text>Create Exercise</Text>
                </Button>
        </View>
        </View>
        </TouchableWithoutFeedback>
        </Modal>
  )
}

export default CreateExercise