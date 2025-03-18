import { View, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
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
        const insertExercise = async (userId: string | null) => {
            if (!userId) return

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
                        user_id: userId
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

        getCurrentUserId().then((userId) => {
            if (userId) {
                insertExercise(userId)
            }
        })
    }

    return (
        <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible)
            }}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1'
                style={{ backgroundColor: theme.background }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View className='flex-1'>
                        <View className='flex-row items-center px-4 pt-16 pb-2'>
                            <TouchableWithoutFeedback onPress={switchModal}>
                                <X size={28} color={theme.text} strokeWidth={2} />
                            </TouchableWithoutFeedback>
                            <H2 className='flex-1 text-center'>New Exercise</H2>
                            <View style={{ width: 28 }} />
                        </View>

                        <ScrollView 
                            className='flex-1'
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View className='px-4'>
                                <View className='mb-4'>
                                    <Label className='text-left mb-2'>Name</Label>
                                    <Input 
                                        className='w-full h-12' 
                                        placeholder='Exercise Name' 
                                        value={name} 
                                        onChangeText={setName}
                                    />
                                </View>

                                <View className='mb-4'>
                                    <Label className='text-left mb-2'>Muscle Groups</Label>
                                    <View className='flex-row flex-wrap justify-between gap-2'>
                                        <ToggleButton name='Chest' state={muscleGroups} setState={() => handleSelectButton('Chest')}/>
                                        <ToggleButton name='Shoulders' state={muscleGroups} setState={() => handleSelectButton('Shoulders')}/>
                                        <ToggleButton name='Back' state={muscleGroups} setState={() => handleSelectButton('Back')}/>
                                        <ToggleButton name='Arms' state={muscleGroups} setState={() => handleSelectButton('Arms')}/>
                                        <ToggleButton name='Legs' state={muscleGroups} setState={() => handleSelectButton('Legs')}/>
                                        <ToggleButton name='Core' state={muscleGroups} setState={() => handleSelectButton('Core')}/>
                                    </View>
                                </View>

                                <View className='flex-row justify-between mb-4'>
                                    <View className='w-[30%]'>
                                        <Label className='text-left mb-2'>Sets</Label>
                                        <Input 
                                            placeholder='0' 
                                            inputMode='numeric' 
                                            value={sets} 
                                            onChangeText={setSets}
                                            className='h-12'
                                        />
                                    </View>
                                    <View className='w-[30%]'>
                                        <Label className='text-left mb-2'>Reps</Label>
                                        <Input 
                                            placeholder='0' 
                                            inputMode='numeric' 
                                            value={reps} 
                                            onChangeText={setReps}
                                            className='h-12'
                                        />
                                    </View>
                                    <View className='w-[30%]'>
                                        <Label className='text-left mb-2'>Rest</Label>
                                        <Input 
                                            placeholder='0s' 
                                            inputMode='numeric' 
                                            value={rest} 
                                            onChangeText={setRest}
                                            className='h-12'
                                        />
                                    </View>
                                </View>

                                <View className='mb-4'>
                                    <Label className='text-left mb-2'>Description</Label>
                                    <Textarea 
                                        placeholder='Description' 
                                        value={description} 
                                        onChangeText={setDescription}
                                        className='h-32'
                                        multiline
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View className='px-4 py-8 border-t border-border'>
                            <Button 
                                className='w-full h-12' 
                                onPress={handleCreateExercise}
                            >
                                <Text className='font-medium'>Create Exercise</Text>
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export default CreateExercise