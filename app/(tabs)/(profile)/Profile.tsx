import { View, ScrollView, Dimensions, Modal, TouchableWithoutFeedback, Keyboard, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Trophy, Calendar, TrendingUp, Activity, BarChart2 } from 'lucide-react-native'
import { ThemeToggle } from '~/components/ThemeToggle'
import { H2, H3 } from '~/components/ui/typography'
import { supabase } from '~/lib/supabase'
import getCurrentUserId from '~/lib/getCurrentUserId'
import { NAV_THEME } from '~/lib/constants'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { Skeleton } from '~/components/ui/skeleton'

interface WorkoutStreak {
  currentStreak: number
  longestStreak: number
  totalWorkouts: number
  lastWorkoutDate: string | null
}

interface PersonalRecord {
  exerciseName: string
  topSet: number
  date: string
  previousTopSet?: number
  improvement?: number
}

interface CompletedWorkout {
  start_time: string
}

interface CompletedExercise {
  exercise_id: string
  topset: number
  Exercises: {
    name: string
  }
  Completed_Workouts: {
    start_time: string
  }[]
}

interface SupabaseResponse {
  exercise_id: string
  topset: number
  Exercises: {
    name: string
  }
  Completed_Workouts: {
    start_time: string
  }
}

interface MonthlyWorkout {
  month: number
  count: number
}

interface WeightEntry {
  created_at: string
  weight: number
}

type TimeFrame = '1mo' | '6mo' | '1year'

const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const LoadingSkeleton = () => {
  return (
    <>
      {/* Streak Section Skeleton */}
      <View className='bg-card rounded-lg p-4 mb-6'>
        <View className='flex-row items-center mb-2 gap-2'>
          <Skeleton className='w-5 h-5 rounded-full' />
          <Skeleton className='w-32 h-6' />
        </View>
        <View className='flex-row justify-between mt-2'>
          {[1, 2, 3].map((i) => (
            <View key={i}>
              <Skeleton className='w-20 h-4 mb-1' />
              <Skeleton className='w-16 h-6' />
            </View>
          ))}
        </View>
        <Skeleton className='w-40 h-4 mt-2' />
      </View>

      {/* Workout Frequency Skeleton */}
      <View className='bg-card rounded-lg p-4 mb-6'>
        <View className='flex-row items-center mb-6 gap-2'>
          <Skeleton className='w-5 h-5 rounded-full' />
          <Skeleton className='w-48 h-6' />
        </View>
        <View className='h-[150px] flex-row justify-between items-end'>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className='w-3 h-[30%] rounded-t' />
          ))}
        </View>
      </View>

      {/* Weight History Skeleton */}
      <View className='bg-card rounded-lg p-4 mb-6'>
        <View className='flex-row items-center justify-between mb-6'>
          <View className='flex-row items-center gap-2'>
            <Skeleton className='w-5 h-5 rounded-full' />
            <Skeleton className='w-32 h-6' />
          </View>
          <Skeleton className='w-24 h-9' />
        </View>
        <View className='flex-row justify-between mb-4'>
          {['1mo', '6mo', '1year'].map((timeFrame) => (
            <Skeleton key={timeFrame} className='flex-1 mx-1 h-9' />
          ))}
        </View>
        <View className='h-[150px] flex-row justify-between items-end'>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className='w-1 h-[40%] rounded-t' />
          ))}
        </View>
      </View>

      {/* Personal Records Skeleton */}
      <View className='bg-card rounded-lg p-4 mb-6'>
        <View className='flex-row items-center mb-2 gap-2'>
          <Skeleton className='w-5 h-5 rounded-full' />
          <Skeleton className='w-40 h-6' />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} className='py-4 border-b border-border'>
            <View className='flex-row justify-between items-center'>
              <Skeleton className='w-32 h-6' />
              <Skeleton className='w-16 h-6' />
            </View>
            <View className='flex-row justify-between items-center mt-1'>
              <Skeleton className='w-24 h-4' />
              <Skeleton className='w-12 h-4' />
            </View>
          </View>
        ))}
      </View>

      {/* Sign Out Button Skeleton */}
      <Skeleton className='w-full h-10' />
    </>
  )
}

const Profile = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [streakData, setStreakData] = useState<WorkoutStreak>({
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    lastWorkoutDate: null
  })
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyWorkouts, setMonthlyWorkouts] = useState<MonthlyWorkout[]>([])
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [showAddWeightModal, setShowAddWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1mo')
  const [refreshing, setRefreshing] = useState(false)

  const calculateStreak = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return

      // Get all completed workouts ordered by date
      const { data: workouts, error } = await supabase
        .from('Completed_Workouts')
        .select('start_time')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (error) throw error

      if (!workouts || workouts.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalWorkouts: 0,
          lastWorkoutDate: null
        }
      }

      const typedWorkouts = workouts as CompletedWorkout[]
      let currentStreak = 0
      let longestStreak = 0
      let currentCount = 0
      let lastDate = new Date(typedWorkouts[0].start_time)
      lastDate.setHours(0, 0, 0, 0) // Normalize to start of day

      // Calculate streaks
      for (let i = 0; i < typedWorkouts.length; i++) {
        const workoutDate = new Date(typedWorkouts[i].start_time)
        workoutDate.setHours(0, 0, 0, 0) // Normalize to start of day

        // Skip if it's the same day as the last workout
        if (i > 0 && workoutDate.getTime() === lastDate.getTime()) {
          continue
        }

        const dayDiff = Math.floor(
          (lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (i === 0 || dayDiff <= 1) {
          currentCount++
          if (currentCount > longestStreak) {
            longestStreak = currentCount
          }
        } else {
          currentCount = 1
        }
        lastDate = workoutDate
      }

      // Check if current streak is still active (within last 24 hours)
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Normalize to start of day
      const lastWorkoutDate = new Date(typedWorkouts[0].start_time)
      lastWorkoutDate.setHours(0, 0, 0, 0) // Normalize to start of day
      
      const lastWorkoutDiff = Math.floor(
        (now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      currentStreak = lastWorkoutDiff <= 1 ? currentCount : 0

      return {
        currentStreak,
        longestStreak,
        totalWorkouts: typedWorkouts.length,
        lastWorkoutDate: typedWorkouts[0].start_time
      }
    } catch (error) {
      console.error('Error calculating streak:', error)
      return null
    }
  }

  const fetchPersonalRecords = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return []

      // Get all exercises with their names and completed workout data
      const { data, error } = await supabase
        .from('Completed_Exercises')
        .select(`
          exercise_id,
          topset,
          Exercises (
            name
          ),
          Completed_Workouts!inner (
            start_time
          )
        `)
        .eq('Completed_Workouts.user_id', userId)
        .order('topset', { ascending: false })

      if (error) throw error

      const typedData = data as unknown as SupabaseResponse[]

      // Group by exercise and get the highest topset and previous topset
      const records = typedData.reduce((acc: Record<string, PersonalRecord>, curr) => {
        const exerciseId = curr.exercise_id
        const currentTopSet = curr.topset
        const exerciseName = curr.Exercises?.name || exerciseId

        if (!acc[exerciseId] || acc[exerciseId].topSet < currentTopSet) {
          // If this is a new PR, store the old one as previous
          console.log(curr.Completed_Workouts)
          const previousTopSet = acc[exerciseId]?.topSet
          acc[exerciseId] = {
            exerciseName,
            topSet: currentTopSet,
            date: curr.Completed_Workouts.start_time,
            previousTopSet,
            improvement: previousTopSet ? currentTopSet - previousTopSet : undefined
          }
        } else if (!acc[exerciseId].previousTopSet || 
                  (acc[exerciseId].previousTopSet < currentTopSet && currentTopSet < acc[exerciseId].topSet)) {
          // Update the previous top set if it's higher than the current previous but lower than the PR
          acc[exerciseId].previousTopSet = currentTopSet
          acc[exerciseId].improvement = acc[exerciseId].topSet - currentTopSet
        }
        return acc
      }, {})

      return Object.values(records)
    } catch (error) {
      console.error('Error fetching personal records:', error)
      return []
    }
  }

  const fetchMonthlyWorkouts = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return []

      const currentYear = new Date().getFullYear()
      const startDate = new Date(currentYear, 0, 1).toISOString()
      const endDate = new Date(currentYear, 11, 31).toISOString()

      const { data, error } = await supabase
        .from('Completed_Workouts')
        .select('start_time')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)

      if (error) throw error

      // Initialize array for all months
      const monthCounts = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0
      }))

      // Count workouts per month
      data.forEach(workout => {
        const month = new Date(workout.start_time).getMonth()
        monthCounts[month].count++
      })

      setMonthlyWorkouts(monthCounts)
    } catch (error) {
      console.error('Error fetching monthly workouts:', error)
      return []
    }
  }

  const fetchWeightHistory = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return

      const { data, error } = await supabase
        .from('User_Weight_History')
        .select('created_at, weight')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setWeightHistory(data || [])
    } catch (error) {
      console.error('Error fetching weight history:', error)
    }
  }

  const addWeightEntry = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId || !newWeight) return

      const weight = parseFloat(newWeight)
      if (isNaN(weight)) return

      const { error } = await supabase
        .from('User_Weight_History')
        .insert([
          {
            user_id: userId,
            weight,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setShowAddWeightModal(false)
      setNewWeight('')
      fetchWeightHistory()
    } catch (error) {
      console.error('Error adding weight entry:', error)
    }
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      const streak = await calculateStreak()
      const records = await fetchPersonalRecords()
      await fetchMonthlyWorkouts()
      await fetchWeightHistory()
      
      if (streak) setStreakData(streak)
      setPersonalRecords(records)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const streak = await calculateStreak()
      const records = await fetchPersonalRecords()
      await fetchMonthlyWorkouts()
      await fetchWeightHistory()
      
      if (streak) setStreakData(streak)
      setPersonalRecords(records)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const getMaxCount = () => {
    
    return Math.max(...monthlyWorkouts.map(m => m.count), 0)
  }

  const screenWidth = Dimensions.get('window').width
  const barWidth = (screenWidth - 80) / 12 // 80 for padding

  const getBarColor = (count: number) => {
    // Convert count to a percentage of the max count
    const maxCount = Math.max(...monthlyWorkouts.map(m => m.count))
    const percentage = count / maxCount

    // Interpolate between dark green (rgb(0, 100, 0)) and neon green (rgb(57, 255, 20))
    const r = Math.round(57 * percentage)
    const g = Math.round(100 + (155 * percentage))
    const b = Math.round(20 * percentage)

    return `rgb(${r}, ${g}, ${b})`
  }

  const getBarData = () => {
    return monthlyWorkouts.map((month) => ({
      value: month.count,
      label: MONTH_ABBREVIATIONS[month.month - 1],
      frontColor: getBarColor(month.count),
      spacing: 4
    }))
  }

  const getFilteredWeightHistory = () => {
    const now = new Date()
    const filteredData = weightHistory.filter(entry => {
      const entryDate = new Date(entry.created_at)
      const monthsAgo = now.getMonth() - entryDate.getMonth() + 
        (12 * (now.getFullYear() - entryDate.getFullYear()))
      
      switch (selectedTimeFrame) {
        case '1mo':
          return monthsAgo <= 1
        case '6mo':
          return monthsAgo <= 6
        case '1year':
          return monthsAgo <= 12
        default:
          return true
      }
    })
    return filteredData
  }

  const getLineData = () => {
    const filteredData = getFilteredWeightHistory()
    if (filteredData.length === 0) return []

    // Calculate how many points to show labels for based on the time frame
    const labelInterval = selectedTimeFrame === '1mo' ? 2 : 
                         selectedTimeFrame === '6mo' ? 3 : 4

    return filteredData.map((entry, index) => ({
      value: entry.weight,
      date: new Date(entry.created_at),
      dataPointText: entry.weight.toString(),
      // Only show label for every nth point to prevent overlap
      label: index % labelInterval === 0 ? `${MONTH_ABBREVIATIONS[new Date(entry.created_at).getMonth()]} ${new Date(entry.created_at).getDate()}` : ''
    }))
  }

  return (
    <ScrollView 
      className='flex-1'
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
          progressBackgroundColor={theme.card}
          style={{ backgroundColor: 'transparent' }}
        />
      }
    >
      <View className='pt-16 px-4'>
        <View className='flex-row justify-between items-center mb-4'>
          <H2 className='w-full'>Profile</H2>
          <View className='absolute top-4 right-0'>
            <ThemeToggle />     
          </View>
        </View>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Streak Section */}
            <View className='bg-card rounded-lg p-4 mb-6'>
              <View className='flex-row items-center mb-2 gap-2'>
                <Trophy size={20} className='text-primary mr-2' color={theme.text} />
                <H3>Workout Streaks</H3>
              </View>
              <View className='flex-row justify-between mt-2'>
                <View>
                  <Text className='text-muted-foreground'>Current Streak</Text>
                  <Text className='text-xl font-bold'>{streakData.currentStreak} days</Text>
                </View>
                <View>
                  <Text className='text-muted-foreground'>Longest Streak</Text>
                  <Text className='text-xl font-bold'>{streakData.longestStreak} days</Text>
                </View>
                <View>
                  <Text className='text-muted-foreground'>Total Workouts</Text>
                  <Text className='text-xl font-bold'>{streakData.totalWorkouts}</Text>
                </View>
              </View>
              {streakData.lastWorkoutDate && (
                <Text className='text-muted-foreground mt-2'>
                  Last workout: {new Date(streakData.lastWorkoutDate).toLocaleDateString()}
                </Text>
              )}
            </View>

            {/* Workout Frequency */}
            <View className='bg-card rounded-lg p-4 mb-6'>
              <View className='flex-row items-center mb-6 gap-2'>
                <BarChart2 size={20} className='text-primary mr-2' color={theme.text} />
                <H3>Workout Frequency {new Date().getFullYear()}</H3>
              </View>
              <View className='mt-4'>
                <BarChart
                  data={getBarData()}
                  barWidth={barWidth - 4}
                  spacing={2}
                  hideRules
                  xAxisLabelTextStyle={{ color: theme.text, fontSize: 12 }}
                  yAxisTextStyle={{ color: theme.text, fontSize: 12 }}
                  noOfSections={5}
                  maxValue={Math.max(...monthlyWorkouts.map(m => m.count))}
                />
              </View>
            </View>

            {/* Weight History */}
            <View className='bg-card rounded-lg p-4 mb-6'>
              <View className='flex-row items-center justify-between mb-6'>
                <View className='flex-row items-center gap-2'>
                  <Activity size={20} className='text-primary mr-2' color={theme.text} />
                  <H3>Weight History</H3>
                </View>
                <Button variant="outline" onPress={() => setShowAddWeightModal(true)}>
                  <Text>Add Weight</Text>
                </Button>
              </View>
              <View className='flex-row justify-between mb-4'>
                {(['1mo', '6mo', '1year'] as TimeFrame[]).map((timeFrame) => (
                  <Button
                    key={timeFrame}
                    variant={selectedTimeFrame === timeFrame ? "default" : "outline"}
                    onPress={() => setSelectedTimeFrame(timeFrame)}
                    className='flex-1 mx-1'
                  >
                    <Text>{timeFrame}</Text>
                  </Button>
                ))}
              </View>
              <View className='mt-4'>
                {weightHistory.length > 0 ? (
                  <LineChart
                    data={getLineData()}
                    color={theme.primary}
                    hideDataPoints={false}
                    thickness={2}
                    hideRules
                    xAxisLabelTextStyle={{ color: theme.text, fontSize: 12 }}
                    yAxisTextStyle={{ color: theme.text, fontSize: 12 }}
                    noOfSections={4}
                    xAxisLabelsVerticalShift={10}
                    xAxisLabelsHeight={30}
                    spacing={40}
                    initialSpacing={20}
                    endSpacing={20}
                    maxValue={Math.max(...getFilteredWeightHistory().map(entry => entry.weight))}
                    dataPointsColor={theme.primary}
                    dataPointsRadius={4}
                    dataPointsWidth={2}
                    dataPointsHeight={2}
                    focusEnabled
                    showFractionalValues
                  />
                ) : (
                  <View className='h-[150px] items-center justify-center'>
                    <Text className='text-muted-foreground'>No weight entries yet</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Personal Records */}
            <View className='bg-card rounded-lg p-4 mb-6'>
              <View className='flex-row items-center mb-2 gap-2'>
                <TrendingUp size={20} className='text-primary mr-2' color={theme.text} />
                <H3>Personal Records</H3>
              </View>
              {personalRecords.map((record) => (
                <View 
                  key={`${record.exerciseName}-${record.date}`}
                  className='py-4 border-b border-border'
                >
                  <View className='flex-row justify-between items-center'>
                    <Text className='font-medium text-lg'>{record.exerciseName}</Text>
                    <Text className='text-lg font-bold'>{record.topSet} lbs</Text>
                  </View>
                  <View className='flex-row justify-between items-center mt-1'>
                    <Text className='text-muted-foreground text-sm'>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                    {record.improvement && (
                      <Text className={record.improvement > 0 ? 'text-green-500' : 'text-red-500'}>
                        {record.improvement > 0 ? '+' : ''}{record.improvement} lbs
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Add Weight Modal */}
            <Modal
              animationType='slide'
              transparent={true}
              visible={showAddWeightModal}
              onRequestClose={() => setShowAddWeightModal(false)}
            >
              <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss()
                setShowAddWeightModal(false)
              }}>
                <View className='flex-1 justify-center items-center bg-black/50'>
                  <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                    <View className='bg-card w-[80%] rounded-lg p-4'>
                      <H3 className='mb-4'>Add Weight Entry</H3>
                      <View className='mb-4'>
                        <Label>Weight (lbs)</Label>
                        <Input
                          keyboardType='decimal-pad'
                          value={newWeight}
                          onChangeText={setNewWeight}
                          placeholder='Enter weight'
                          autoFocus={true}
                        />
                      </View>
                      <View className='flex-row justify-end gap-2'>
                        <Button variant="outline" onPress={() => setShowAddWeightModal(false)}>
                          <Text>Cancel</Text>
                        </Button>
                        <Button onPress={addWeightEntry}>
                          <Text>Save</Text>
                        </Button>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            {/* Sign Out Button */}
            <Button onPress={() => supabase.auth.signOut()}>
              <Text>Sign Out</Text>
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  )
}

export default Profile