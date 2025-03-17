import { View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import MonthSum from '~/components/Home/MonthSum'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { supabase } from '~/lib/supabase'
import RecentWorkout from '~/components/Home/RecentWorkout'
import { H3 } from '~/components/ui/typography'
import WorkoutsModal from '~/components/Home/WorkoutsModal'
import { Skeleton } from '~/components/ui/skeleton'
import getCurrentUserId from '~/lib/getCurrentUserId'

// Types
interface CompletedWorkout {
  id: string;
  user_id: string;
  start_time: string;
  calories_burnt: number;
  total_weight: number;
  [key: string]: any; // For any additional properties
}

interface MonthlySummary {
  totalCalories: number;
  totalWeight: number;
}

const Home = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    totalCalories: 0,
    totalWeight: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getCompletedWorkoutsForUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Completed_Workouts')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (error) throw error

      setCompletedWorkouts(data || [])
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setError('Failed to load workouts')
    }
  }, [])

  const getMonthlySummaryDataForUser = useCallback(async (userId: string) => {
    try {
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('Completed_Workouts')
        .select('calories_burnt, total_weight')
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())
        .eq('user_id', userId)

      if (error) throw error

      setMonthlySummary({
        totalCalories: data?.length || 0,
        totalWeight: data?.reduce((total, workout) => total + (workout.total_weight || 0), 0) || 0
      })
    } catch (error) {
      console.error('Error fetching monthly summary:', error)
      setError('Failed to load monthly summary')
    }
  }, [])

  const refreshExercises = useCallback(async () => {
    if (!userId) return

    setRefreshing(true)
    setError(null)
    
    try {
      await Promise.all([
        getCompletedWorkoutsForUser(userId),
        getMonthlySummaryDataForUser(userId)
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }, [userId, getCompletedWorkoutsForUser, getMonthlySummaryDataForUser])

  const formatCompactNumber = useCallback((num: number): string => {
    if (num === 0) return '0'
    
    const absNum = Math.abs(num)
    const suffixes = ['', 'k', 'm', 'b', 't']
    const suffixNum = Math.min(
      Math.floor(absNum === 0 ? 0 : Math.log10(absNum) / 3),
      suffixes.length - 1
    )
    
    const shortNumber = num / Math.pow(10, suffixNum * 3)
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    })
  
    return suffixNum === 0 
      ? num.toString() 
      : formatter.format(shortNumber) + suffixes[suffixNum]
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const currentUserId = await getCurrentUserId()
        
        if (!currentUserId) {
          throw new Error('No user ID found')
        }

        setUserId(currentUserId)
        await Promise.all([
          getCompletedWorkoutsForUser(currentUserId),
          getMonthlySummaryDataForUser(currentUserId)
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load initial data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const renderSkeleton = () => (
    <>
      <Skeleton className='w-[80%] h-[30px]' />
      <Skeleton className='w-[30%] h-[30px] mt-4' />
    </>
  )

  const renderEmptyState = () => (
    <View className='items-center justify-center py-8'>
      <Text className='text-center text-gray-500'>
        No completed workouts yet.{'\n'}Time to start your fitness journey!
      </Text>
    </View>
  )

  return (
    <View className='flex-1'>
      <WorkoutsModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
      <ScrollView
        className='flex-1'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshExercises}
          />
        }
      >
        <View className='flex-col justify-around items-center mt-20 px-4'>
          <MonthSum />
          <View className='justify-between flex-row w-full mb-6 mt-6'>
            <Card className='w-[45%]'>
              <CardHeader className='pb-2'>
                <CardTitle>Workouts</CardTitle>
              </CardHeader>
              <CardContent className='pb-0'>
                {loading ? (
                  <Skeleton className='w-full h-[30px]' />
                ) : (
                  <Text className='text-[22px]'>{monthlySummary.totalCalories}</Text>
                )}
              </CardContent>
              <CardFooter className='pt-0'>
                <Text className='text-sm text-muted-foreground'>this month</Text>
              </CardFooter>
            </Card>
            <Card className='w-[45%]'>
              <CardHeader className='pb-2'>
                <CardTitle>Volume</CardTitle>
              </CardHeader>
              <CardContent className='pb-0'>
                {loading ? (
                  <Skeleton className='w-full h-[30px]' />
                ) : (
                  <Text className='text-[22px]'>
                    {formatCompactNumber(monthlySummary.totalWeight)}
                    <Text className='text-[18px]'> lbs</Text>
                  </Text>
                )}
              </CardContent>
              <CardFooter className='pt-0 '>
                <Text className='text-sm text-muted-foreground'>this month</Text>
              </CardFooter>
            </Card>
          </View>

          <H3 className='text-left w-full mb-4'>Recent Workouts</H3>
          {loading ? (
            <Skeleton className='w-full h-[140px]' />
          ) : error ? (
            <Text className='text-red-500 text-center'>{error}</Text>
          ) : completedWorkouts.length === 0 ? (
            renderEmptyState()
          ) : (
            <View className='gap-4 w-full'>
              {completedWorkouts.map((workout) => (
                <RecentWorkout key={workout.id} workout={workout} />
              ))}
              <View className='h-36' />
            </View>
          )}
        </View>
      </ScrollView>
      
      <View className='absolute bottom-4 w-full items-center px-4'>
        <Button 
          className='w-full flex-row justify-center items-center gap-2' 
          variant="outline" 
          onPress={() => setModalVisible(true)}
          disabled={loading}
        >
          <Text className='font-bold'>Start Workout</Text>
        </Button>
      </View>
    </View>
  )
}

export default Home