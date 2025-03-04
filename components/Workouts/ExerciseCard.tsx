import { View,} from 'react-native'
import React from 'react'
import { Text } from '~/components/ui/text'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'

const ExerciseCard = ({exercise}: any) => {

  return (
    <View className='px-6 py-2'>
    <Card className=''>
        <CardHeader className='pb-0'>
            <CardTitle>{exercise.name}</CardTitle>
            <CardDescription>{exercise.desc}</CardDescription>
        </CardHeader>
        <CardContent className='gap-2'>
            // adds n rows of sets where n is exercise.sets
            {Array.from({length: exercise.sets}, (_, i) => (
                <View className='flex-row border border-[#222] justify-between py-2 px-4 items-center'>
                    <Label nativeID='reps' className='font-bold'>Set {i + 1}</Label>
                    <Separator orientation='vertical' />
                    <Input nativeID='reps' className='w-1/4 h-6' placeholder='Reps' />
                    <Separator orientation='vertical' />
                    <Input nativeID='weight' className='w-1/4 h-8' placeholder='lbs' />
                </View>
            ))}
        </CardContent>
    </Card>
    </View>
  )
}

export default ExerciseCard