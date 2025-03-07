import { View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import MonthSum from '~/components/Home/MonthSum'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { supabase } from '~/lib/supabase'
import RecentWorkout from '~/components/Home/RecentWorkout'
import { H1, H2, H3, H4 } from '~/components/ui/typography'
import WorkoutsModal from '~/components/Home/WorkoutsModal'
import { Skeleton } from '~/components/ui/skeleton'

const Home = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [userId, setUserId] = useState('')
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  

  const refreshExercises = async () => {
    setLoading(true)
    setRefreshing(true)
    console.log(userId)
    if (userId) {
      await getCompletedWorkoutsForUser(userId)
      await getMonthlySummaryDataForUser(userId)
    }
    console.log('done')
    setRefreshing(false)
    setLoading(false)
  }

  const getCompletedWorkoutsForUser = async (userId: any) => {
    if (!userId) return  

    const { data, error } = await supabase
      .from('Completed_Workouts') 
      .select('*') 
      .eq('user_id', userId)  
      .order('start_time', { ascending: false })

    if (error) {
      console.error('Error fetching exercises:', error) 
      return null 
    }

    if (data) {
      setCompletedWorkouts(data)
    }
  }

  const getMonthlySummaryDataForUser = async (userId: any) => {
    const calculateTotalCalories = (data: any) => {
      console.log(data)
      return data.length
    }

    const calculateTotalWeight = (data: any) => {
      return data.reduce((total: any, workout: any) => total + workout.total_weight, 0)
      
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Query completed_workouts table
    const { data, error } = await supabase
      .from('Completed_Workouts')
      .select('calories_burnt, total_weight')
      .gte('start_time', startOfMonth.toISOString())
      .lte('start_time', endOfMonth.toISOString())

    if (error) {
      console.log('Error fetching monthly summary data:', error);
    }

    if (data) {
      const totalCals = calculateTotalCalories(data)
      const totalWeight = calculateTotalWeight(data)
      setTotalCalories(totalCals)
      setTotalWeight(totalWeight)
      console.log('Total calories:', totalCalories)
      console.log('Total weight:', totalWeight)
    }
    
  }

  function formatCompactNumber(num: number): string {
    const absNum = Math.abs(num);
    const suffixes = ['', 'k', 'm', 'b', 't'];
    const suffixNum = Math.min(
      Math.floor(absNum === 0 ? 0 : Math.log10(absNum) / 3),
      suffixes.length - 1
    );
    
    const shortNumber = num / Math.pow(10, suffixNum * 3);
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
  
    // Handle edge case for numbers between 0-999
    if (suffixNum === 0) return num.toString();
  
    return formatter.format(shortNumber) + suffixes[suffixNum];
  }

  useEffect(() => {
    const fetchUserData = async () => {
      // const currentUserId = await getCurrentUserId()
      const currentUserId = 'e9cac5f4-62df-46bd-afc4-08d89aba2f51' 
      if (currentUserId) {
        await getCompletedWorkoutsForUser(currentUserId)
        await getMonthlySummaryDataForUser(currentUserId)
      }
    } 
    setLoading(true)
    fetchUserData() 
    setLoading(false)
  }, []) 
  return (
    <View>
      <WorkoutsModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
      <ScrollView
      className='h-full'
      refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshExercises}
          />
        }
      >
        <View className='flex-col justify-around items-center mt-20 h-full'>
          <MonthSum />
          <View className='justify-between flex-row w-[90%]'>
            <Card className='w-[165px] h-[110px]'>
              <CardHeader>
                <CardTitle>Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className='text-[22px]'>{totalCalories}<Text> kcal</Text></Text>
              </CardContent>
            </Card>
            <Card className='w-[165px] h-[110px]'>
              <CardHeader>
                <CardTitle>Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className='text-[22px]'>{formatCompactNumber(totalWeight)}<Text> lbs</Text></Text>

              </CardContent>
            </Card>
          </View>
          <H3 className='text-left w-[90%]'>Recent Workouts</H3>
            {loading ? 
                    <Skeleton className=' w-[90%] h-[140px]' />
                    :
                    <>
                    {completedWorkouts.length > 0 ?
              <View className='gap-4'>
              {completedWorkouts.map((workout: any) => (
                <RecentWorkout key={workout.id} workout={workout} />
              ))}
                <View className='h-36' />
              </View>
              :
              <Text>No completed workouts,
                you should be ashamed
              </Text>
            }
                    </>  
                }
        </View>
        
      </ScrollView>
      <View className=' aboslute bottom-14 items-center'>
        <Button className='w-[90%]' onPress={() => setModalVisible(true)}>
          <Text className='font-bold'>Start Workout</Text>
        </Button>
      </View>
    </View>
  )
}

export default Home