import React, { useEffect } from 'react'
import getCurrentUserId from '../../lib/getCurrentUserId'
import { supabase } from '../../lib/supabase'
import { View } from 'react-native'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Calendar, Activity } from 'lucide-react-native'

const MonthSum = () => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const [daysGrid, setDaysGrid] = React.useState<(number | null)[][]>([])
    const [daysArray, setDaysArray] = React.useState<number[]>([])
    const [totalWorkouts, setTotalWorkouts] = React.useState(0)

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const createDaysGrid = () => {
        let month = new Date()
        const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
        const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDay()
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

        const daysGrid: (number | null)[][] = []
        let currentDay = 1

        let week: (number | null)[] = []
        for (let i = 0; i < 7; i++) {
            if (i < firstDayOfMonth) {
                week.push(null)
            } else {
                week.push(new Date(month.getFullYear(), month.getMonth(), i - firstDayOfMonth + 1).getDate())
                currentDay++
            }
        }
        daysGrid.push(week)

        while (currentDay + 6 < daysInMonth) {
            week = []
            for (let i = 0; i < 7; i++) {
                week.push(currentDay)
                currentDay++
            }
            daysGrid.push(week)
        }

        week = []
        for (let i = 0; i < 7; i++) {
            if (currentDay <= daysInMonth) {
                week.push(currentDay)
                currentDay++
            } else {
                week.push(null)
            }
        }
        daysGrid.push(week)
        setDaysGrid(daysGrid)
    }  

    const getCompletedDays = async (userId: string) => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        const { data, error } = await supabase
            .from('Completed_Workouts')
            .select('start_time')
            .eq('user_id', userId)
            .gte('start_time', startOfMonth)
            .lte('start_time', endOfMonth)

        if (error) {
            console.error('Error fetching completed workouts:', error)
            return null
        }
        if (data) {
            const daysArray = data.map((workout: any) => {
                const date = new Date(workout.start_time)
                return date.getDate()
            })
            setDaysArray(daysArray)
            setTotalWorkouts(daysArray.length)
        }
    }

    useEffect(() => {
        createDaysGrid()
        getCurrentUserId().then((userId: any) => {
            getCompletedDays(userId)
        })
    }, [])


    return (
        <Card className='w-full'>
            <CardHeader className='pb-2'>
                <View className='flex-row items-center justify-between'>
                    <View className='flex-row items-center gap-2'>
                        <Calendar size={24} color={theme.primary} />
                        <CardTitle className='text-xl'>{months[new Date().getMonth()]} {new Date().getFullYear()}</CardTitle>
                    </View>
                </View>
            </CardHeader>
            <CardContent>
                {/* Days of Week Header */}
                <View className='flex-row justify-between mb-3'>
                    {daysOfWeek.map((day, index) => (
                        <View key={index} className='w-[32px] items-center'>
                            <Text className='text-sm font-medium text-muted-foreground'>{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View className='gap-1'>
                    {daysGrid.map((week, index) => (
                        <View key={`week-${index}`} className='flex-row justify-between'>
                            {week.map((day, dayIndex) => (
                                <View 
                                    key={`day-${dayIndex}-${index}`} 
                                    className='w-[32px] h-[32px] items-center justify-center'
                                >
                                    {day && (
                                        <View 
                                            className={`w-[28px] h-[28px] rounded-full items-center justify-center
                                                ${daysArray.includes(day) 
                                                    ? 'bg-primary' 
                                                    : 'border border-border'
                                                }`}
                                        >
                                            <Text 
                                                className={`text-sm ${
                                                    daysArray.includes(day) 
                                                        ? 'text-primary-foreground font-medium' 
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {day}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View className='flex-row items-center justify-center gap-4 mt-4'>
                    <View className='flex-row items-center gap-2'>
                        <View className='w-3 h-3 rounded-full bg-primary' />
                        <Text className='text-sm text-muted-foreground'>Workout Day</Text>
                    </View>
                    <View className='flex-row items-center gap-2'>
                        <View className='w-3 h-3 rounded-full border border-border' />
                        <Text className='text-sm text-muted-foreground'>Rest Day</Text>
                    </View>
                </View>
            </CardContent>
        </Card>
    )
}

export default MonthSum