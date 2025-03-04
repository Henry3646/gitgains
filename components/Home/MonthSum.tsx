import React, { useEffect } from 'react'
import getCurrentUserId from '../../lib/getCurrentUserId'
import { supabase } from '../../lib/supabase'
import { View } from 'react-native'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'

const MonthSum = () => {
    const { colorScheme, isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const [daysGrid, setDaysGrid] = React.useState<(number | null)[][]>([])
    const [daysArray, setDaysArray] = React.useState<number[]>([])

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const createDaysGrid = () => {
        let month = new Date()
        const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
        const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDay();
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

        const daysGrid: (number | null)[][] = [];
        let currentDay = 1;

        let week: (number | null)[] = [];
        for (let i = 0; i < 7; i++) {
            if (i < firstDayOfMonth) {
                week.push(null);
            } else {
                week.push(new Date(month.getFullYear(), month.getMonth(), i - firstDayOfMonth + 1).getDate())
                currentDay++
            }
        }
        daysGrid.push(week);

        while (currentDay + 6 < daysInMonth) {
            week = [];
            for (let i = 0; i < 7; i++) {
                week.push(currentDay);
                currentDay++;
            }
            daysGrid.push(week);
        }

        week = [];
        for (let i = 0; i < 7; i++) {
            if (currentDay <= daysInMonth) {
                week.push(currentDay);
                currentDay++;
            } else {
                week.push(null);
            }
        }
        daysGrid.push(week);
        setDaysGrid(daysGrid);
    }  

    const getCompletedDays = async (userId: string) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        const { data, error } = await supabase
            .from('Completed_Workouts')
            .select('start_time')
            .eq('user_id', userId)
            .gte('start_time', startOfMonth)
            .lte('start_time', endOfMonth)

        if (error) {
            console.error('Error fetching completed workouts:', error);
            return null;
        }
        if (data) {
            const daysArray = data.map((workout: any) => {
                const date = new Date(workout.start_time)
                return date.getDate()
            })
            setDaysArray(daysArray)
        }
  }


  useEffect(() => {
    createDaysGrid()
    getCurrentUserId().then((userId: any) => {
      getCompletedDays('e9cac5f4-62df-46bd-afc4-08d89aba2f51')
    })
  }, [])

  

  return (
    <Card className='w-[90%]'>
        <CardHeader>
            <CardTitle>{months[new Date().getMonth()]} {new Date().getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
            <View className='flex-col gap-3'>
                {daysGrid.map((week, index) => (
                    <View key={`week-${week}-${index}`} className='justify-around flex-row'>
                    {week.map((value: any, dayIndex: any) => (
                        <>
                            {daysArray ?
                                <View 
                                    key={`day-${dayIndex}-${index}`} 
                                    className={`w-[20px] h-[20px] rounded`} 
                                    style={{ 
                                        backgroundColor: `${daysArray.includes(value) ? theme.text : 'transparent'}`, 
                                        borderWidth: 2,
                                        borderColor: `${daysGrid[index][dayIndex] ? theme.text : 'transparent'}`,
                                    }}/>
                            :
                            <View key={`day-${dayIndex}-${index}`}></View>
                            }
                        </>
                    ))}
                    </View>
                ))}
            </View>
            <View className='justify-around flex-row mt-4'>
                {daysOfWeek.map((day, index) => (
                    <View key={index} className=' w-[20px] items-center justify-center'>
                        <Text className='text-[18px] font-bold'>{day}</Text>
                    </View>
                ))}
            </View>
        </CardContent>
    </Card>
  )
  }

export default MonthSum