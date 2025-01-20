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
import { supabase } from '~/lib/supabase'

const Home = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [userId, setUserId] = useState('')
  const [completedWorkouts, setCompletedWorkouts] = useState([])
  const [totalCalories, setTotalCalories] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)

  const refreshExercises = async () => {
    setRefreshing(true)
    if (userId) {
      await getCompletedWorkoutsForUser(userId)
      await getMonthlySummaryDataForUser(userId)
    }
    setRefreshing(false)
  }

  const getCurrentUserId = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error fetching session:', error)
      return null
    }

    const session = data?.session
    if (session?.user) {
      setUserId(session.user.id)
      return session.user.id
    }
    return null 
  } 

  const getCompletedWorkoutsForUser = async (userId: any) => {
    if (!userId) return  

    const { data, error } = await supabase
      .from('Completed_Workout') 
      .select('*, User_CompletedWorkout!inner(user_id)') 
      .eq('User_CompletedWorkout.user_id', userId)  
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
      return data.reduce((total: any, workout: any) => total + workout.calories_burnt, 0)
    }

    const calculateTotalWeight = (data: any) => {
      return data.reduce((total: any, workout: any) => total + workout.total_weight, 0)
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Query completed_workouts table
    const { data, error } = await supabase
      .from('Completed_Workout')
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

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUserId = await getCurrentUserId() 
      if (currentUserId) {
        await getCompletedWorkoutsForUser(currentUserId)
        await getMonthlySummaryDataForUser(currentUserId)
      }
    } 
    fetchUserData() 
  }, []) 
  return (
    <ScrollView
    refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshExercises}
        />
      }
    >
      <View className='flex-col justify-around items-center gap-6'>
        <MonthSum />
        <View className='justify-between flex-row w-[90%]'>
          <Card className='w-[165px] h-[110px]'>
            <CardHeader>
              <CardTitle>Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className='text-[22px]'>{totalCalories}<Text>kcal</Text></Text>
            </CardContent>
          </Card>
          <Card className='w-[165px] h-[110px]'>
            <CardHeader>
              <CardTitle>Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className='text-[22px]'>{totalWeight}<Text>lbs</Text></Text>
              
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  )
}

export default Home