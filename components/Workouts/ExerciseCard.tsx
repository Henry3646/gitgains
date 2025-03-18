import { View, Platform, TouchableOpacity, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Text } from '~/components/ui/text'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { Timer, Play, Square } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { ExerciseCardProps } from '~/types/exercise'

const ExerciseCard = ({exercise, exerciseData, handleRepChange, handleWeightChange, status}: ExerciseCardProps) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
    const [isResting, setIsResting] = useState(false)
    const [timeLeft, setTimeLeft] = useState(exercise.rest)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const progressAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (isResting && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        setIsResting(false)
                        setIsPaused(false)
                        return exercise.rest
                    }
                    return prev - 1
                })
            }, 1000)

            // Animate progress bar
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: exercise.rest * 1000,
                useNativeDriver: false,
            }).start()
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
            if (isPaused) {
                progressAnim.stopAnimation()
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isResting, isPaused, exercise.rest])

    const toggleRest = () => {
        if (!isResting) {
            setIsResting(true)
            setIsPaused(false)
            progressAnim.setValue(0)
        } else {
            setIsResting(false)
            setIsPaused(false)
            setTimeLeft(exercise.rest)
            progressAnim.setValue(0)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleRepInput = (setIndex: number, value: string) => {
        const numValue = value === '' ? '' : Number(value)
        if (numValue === '' || (numValue >= 0 && numValue <= 999)) {
            handleRepChange(exercise.id, setIndex, value)
        }
    }

    const handleWeightInput = (setIndex: number, value: string) => {
        const numValue = value === '' ? '' : Number(value)
        if (numValue === '' || (numValue >= 0 && numValue <= 999)) {
            handleWeightChange(exercise.id, setIndex, value)
        }
    }

    return (
      <View className='py-2'>
        <Card className=''>
          <CardHeader className='pb-1'>
            <View className='flex-row justify-between items-start'>
              <View className='flex-1'>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>{exercise.desc}</CardDescription>
              </View>
              <TouchableOpacity 
                onPress={toggleRest}
                className='ml-4'
              >
                {isResting ? (
                  <Square size={20} color={theme.primary} />
                ) : (
                  <Play size={20} color={theme.text} />
                )}
              </TouchableOpacity>
            </View>
            {isResting && (
              <View className='mt-2'>
                <View className='h-1 bg-muted rounded-full overflow-hidden'>
                  <Animated.View 
                    className='h-full bg-green-500 rounded-full'
                    style={{
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }}
                  />
                </View>
                <Text className='text-xs text-green-500 mt-1 text-right'>
                  {formatTime(timeLeft)}
                </Text>
              </View>
            )}
          </CardHeader>
          <CardContent className='gap-2'>
            {Array.from({length: exercise.sets}, (_, i) => (
              <View 
                key={`set-${i}`}
                className='flex-row border border-[#222] justify-between px-6 items-center'
              >
                <Label className='font-bold'>Set {i + 1}</Label>
                <Separator orientation='vertical' />
                <Input
                  value={exerciseData?.sets[i]?.reps?.toString() || ''}
                  onChangeText={(text) => handleRepInput(i, text)}
                  keyboardType='number-pad'
                  maxLength={3}
                  className='w-1/4 h-8 text-center my-2'
                  placeholder='Reps'
                  editable={status === 'running'}
                />
                <Separator orientation='vertical' />
                <Input
                  value={exerciseData?.sets[i]?.weight?.toString() || ''}
                  onChangeText={(text) => handleWeightInput(i, text)}
                  keyboardType='number-pad'
                  maxLength={3}
                  className='w-1/4 h-8 text-center my-2'
                  placeholder='lbs'
                  editable={status === 'running'}
                />
              </View>
            ))}
          </CardContent>
        </Card>
      </View>
    )
  }
  
export default ExerciseCard