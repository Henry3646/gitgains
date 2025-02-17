import { View } from 'react-native'
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { supabase } from '~/lib/supabase'
import { H1, H2, H3, H4 } from '~/components/ui/typography'
import { SquareDashedKanban } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'


const RecentWorkout = ({ workout }: { workout: any }) => {
    const { isDarkColorScheme } = useColorScheme();
    const formatTime = (time: string) => {
        const date = new Date(time)

        const monthAbv = date.toLocaleString('default', { month: 'short' })
        const day = date.getDate()
        const year = date.getFullYear()
        const time2 = date.toLocaleTimeString()
        return `${monthAbv} ${day}, ${year} ${time2}`
    }
  return (
    <Card className='w-[90%]'>
        <CardContent className='mt-6'>
            <View className='flex flex-row justify-between w-full '>
                <View className='flex flex-col w-[75%] '>
                    <H3>{workout.workout_name}</H3>
                    <Text className='opacity-[0.5]'>{formatTime(workout.start_time)}</Text>
                    <View className='flex flex-row justify-between '>
                        <View className='flex flex-col items-center'>
                            <Text className='font-bold'>Exercises</Text>
                            <Text>{workout.num_exercises}</Text>
                        </View>
                        <View className='flex flex-col items-center'>
                            <Text className='font-bold'>Volume</Text>
                            <Text>{workout.total_weight}</Text>
                        </View>
                        <View className='flex flex-col items-center'>
                            <Text className='font-bold'>Duration</Text>
                            <Text>{workout.total_time}</Text>
                        </View>
                    </View>
                </View>
                <View className='items-center justify-center pt-6'>
                    <SquareDashedKanban size={60} color={isDarkColorScheme ? 'white' : 'black'} strokeWidth={1}/>
                </View>
            </View>
        </CardContent>
    </Card>
  )
}

export default RecentWorkout