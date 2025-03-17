import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Text } from '~/components/ui/text'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Check, Square, SquareCheck } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
  desc: string | null
  muscle_group?: string
}

interface ExerciseComponentProps {
  exercise: Exercise
  checked: boolean
  editable: boolean
  orderNumber?: number
  onUpdate?: (updates: Partial<Exercise>) => void
}

const ExerciseComponent = ({ exercise, checked, editable, orderNumber, onUpdate }: ExerciseComponentProps) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light

  return (
    <Card className=''>
      <CardHeader className='pb-1'>
        <View className='flex-row justify-between items-start'>
          <View className='flex-1'>
            <CardTitle>{exercise.name}</CardTitle>
            <CardDescription>{exercise.desc}</CardDescription>
          </View>
          {checked ? (
            <View className='ml-4 w-6 h-6 rounded-full bg-primary/20 items-center justify-center'>
              <Text className='text-primary font-medium'>{orderNumber}</Text>
            </View>
          ) : (
            <Square size={24} color={theme.text} className='ml-4' />
          )}
        </View>
      </CardHeader>
      <CardContent className='gap-2'>
        <View className='flex-row items-center gap-2'>
          <View className='flex-row items-center gap-1'>
            <View className='w-2 h-2 rounded-full bg-primary/20' />
            <Text className='text-sm text-muted-foreground'>{exercise.sets} sets</Text>
          </View>
          <Separator orientation='vertical' className='h-4' />
          <View className='flex-row items-center gap-1'>
            <View className='w-2 h-2 rounded-full bg-primary/20' />
            <Text className='text-sm text-muted-foreground'>{exercise.reps} reps</Text>
          </View>
          <Separator orientation='vertical' className='h-4' />
          <View className='flex-row items-center gap-1'>
            <View className='w-2 h-2 rounded-full bg-primary/20' />
            <Text className='text-sm text-muted-foreground'>{exercise.rest}s rest</Text>
          </View>
        </View>
        {exercise.muscle_group && (
          <View className='flex-row gap-2'>
            <View className='px-2 py-1 rounded-full bg-primary/10'>
              <Text className='text-xs text-primary capitalize'>{exercise.muscle_group}</Text>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  )
}

export default ExerciseComponent