import { View, Platform } from 'react-native'
import React from 'react'
import { Text } from '~/components/ui/text'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'

type ExerciseCardProps = {
    exercise: any
    exerciseData: any
    handleRepChange: any
    handleWeightChange: any
    status: string
}

const ExerciseCard = ({exercise, exerciseData, handleRepChange, handleWeightChange, status}: ExerciseCardProps) => {
    return (
      <View className='px-6 py-2'>
        <Card className=''>
          <CardHeader className='pb-0'>
            <CardTitle>{exercise.name}</CardTitle>
            <CardDescription>{exercise.desc}</CardDescription>
          </CardHeader>
          <CardContent className='gap-2'>
            {Array.from({length: exercise.sets}, (_, i) => (
              <View 
                key={`set-${i}`}
                className='flex-row border border-[#222] justify-between px-6 items-center'
              >
                <Label className='font-bold '>Set {i + 1}</Label>
                <Separator orientation='vertical' />
                <Input
                  value={exerciseData?.sets[i]?.reps?.toString() || ''}
                  onChangeText={(text) => handleRepChange(exercise.id, i, text)}
                  keyboardType='decimal-pad'
                  className='w-1/4 h-8 text-center my-2'
                  placeholder='Reps'
                  editable={status === 'running'}
                />
                <Separator orientation='vertical' />
                <Input
                  value={exerciseData?.sets[i]?.weight?.toString() || ''}
                  onChangeText={(text) => handleWeightChange(exercise.id, i, text)}
                  keyboardType='decimal-pad'
                  className='w-1/4 h-8 text-center my-2'
                  placeholder='lbs'
                  editable={status === 'running'}
                />
              </View>
            ))}
          </CardContent>
        </Card>
      </View>
    )
  }
  
export default ExerciseCard