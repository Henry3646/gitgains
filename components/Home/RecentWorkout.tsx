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
import { SquareDashedKanban, Clock, Dumbbell, LayoutGrid } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'


const RecentWorkout = ({ workout }: { workout: any }) => {
    const { isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light

    const formatTime = (time: string) => {
        const date = new Date(time)
        const monthAbv = date.toLocaleString('default', { month: 'short' })
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const formattedHours = hours % 12 || 12
        const formattedMinutes = minutes.toString().padStart(2, '0')
        return `${monthAbv} ${day} · ${formattedHours}:${formattedMinutes}${ampm}`
    }
    const formatDuration = (duration: number) => {
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }
    const abbreviateVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`
        }
        return volume.toString()
    }
  return (
    <Card className='w-full overflow-hidden'>
        <CardContent className='p-4'>
            <View className='mb-4'>
                <H3 className='mb-1'>{workout.workout_name}</H3>
                <Text className='text-muted-foreground text-sm'>{formatTime(workout.start_time)}</Text>
            </View>

            <View className='flex-row justify-between'>
                <View className='flex-1 flex-row items-center'>
                    <View className='bg-primary/10 p-2 rounded-full mr-3'>
                        <LayoutGrid size={18} color={theme.primary} />
                    </View>
                    <View>
                        <Text className='text-sm text-muted-foreground'>Exercises</Text>
                        <Text className='font-medium'>{workout.num_exercises}</Text>
                    </View>
                </View>

                <View className='flex-1 flex-row items-center'>
                    <View className='bg-primary/10 p-2 rounded-full mr-3'>
                        <Dumbbell size={18} color={theme.primary} />
                    </View>
                    <View>
                        <Text className='text-sm text-muted-foreground'>Volume</Text>
                        <Text className='font-medium'>{abbreviateVolume(workout.total_weight)} lbs</Text>
                    </View>
                </View>

                <View className='flex-1 flex-row items-center'>
                    <View className='bg-primary/10 p-2 rounded-full mr-3'>
                        <Clock size={18} color={theme.primary} />
                    </View>
                    <View>
                        <Text className='text-sm text-muted-foreground'>Duration</Text>
                        <Text className='font-medium'>{formatDuration(workout.total_time)}</Text>
                    </View>
                </View>
            </View>
        </CardContent>
    </Card>
  )
}

export default RecentWorkout