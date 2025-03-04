import { TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '~/components/ui/text'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Ellipsis } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { router } from 'expo-router'

const SavedWorkout = ({workout}: {workout: any}) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
    
    useEffect(() => {
        console.log(workout.id)
    }, [])
  return (
    <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/(workouts)/ViewWorkout', params: { workoutId: workout.id}})} activeOpacity={1}>
        <Card className=''>
            <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription className=''>{workout.desc}</CardDescription>
            </CardHeader>
            <CardFooter >
                {workout?.muscle_groups.map((muscle: any, index: any) => (
                    <Badge key={muscle} className='mr-4'>
                        <Text>{muscle}</Text>
                    </Badge>
                ))}
            </CardFooter>
        </Card>
    </TouchableOpacity>
  )
}

export default SavedWorkout