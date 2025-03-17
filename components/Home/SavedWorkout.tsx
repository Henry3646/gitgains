import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Text } from '~/components/ui/text'
import {
  Card,
  CardContent,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Dumbbell, LayoutGrid, Timer } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { router } from 'expo-router'
import { H3 } from '~/components/ui/typography'

interface SavedWorkoutProps {
  workout: any;
  setModalVisible: (visible: boolean) => void;
}

const SavedWorkout = ({ workout, setModalVisible }: SavedWorkoutProps) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  
  const handleWorkoutPress = () => {
    setModalVisible(false)
    router.push({ 
      pathname: '/(tabs)/(workouts)/ViewWorkout', 
      params: { workoutId: workout.id }
    })
  }

  return (
    <TouchableOpacity 
      onPress={handleWorkoutPress} 
      activeOpacity={1}
    >
      <Card className='w-full overflow-hidden'>
        <CardContent className='p-4'>
          {/* Title and Description */}
          <View className='mb-4'>
            <H3 className='mb-1'>{workout.name}</H3>
            {workout.desc && (
              <Text className='text-muted-foreground text-sm' numberOfLines={2}>
                {workout.desc}
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View className='flex-row items-center mb-4'>
            {/* Exercise Count */}
            <View className='flex-row items-center mr-6'>
              <View className='bg-primary/10 p-1.5 rounded-full mr-2'>
                <LayoutGrid size={14} color={theme.primary} />
              </View>
              <Text className='text-sm'>
                {workout.total_sets || 0} sets
              </Text>
            </View>

            {/* Estimated Time */}
            <View className='flex-row items-center'>
              <View className='bg-primary/10 p-1.5 rounded-full mr-2'>
                <Timer size={14} color={theme.primary} />
              </View>
              <Text className='text-sm'>
                ~{Math.ceil((workout.total_sets || 0) * 3)} min
              </Text>
            </View>
          </View>

          {/* Muscle Groups */}
          <View className='flex-row flex-wrap gap-2'>
            {workout?.muscle_groups?.map((muscle: string) => (
              <Badge 
                key={muscle} 
                variant="secondary"
                className='bg-secondary/50'
              >
                <Text className='text-xs capitalize'>{muscle.toLowerCase()}</Text>
              </Badge>
            ))}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  )
}

export default SavedWorkout