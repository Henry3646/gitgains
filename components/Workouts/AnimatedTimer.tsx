import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, Text, Alert } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Button } from '../ui/button';
import { Text as TextUI } from '../ui/text';
import { Square, Play } from 'lucide-react-native';

interface AnimatedTimerProps {
    time: number
    setTime: any
    onStop: any
    status: string
    setStatus: any
    setStartTime: any
}

const AnimatedTimer = ({ time, setTime, onStop, status, setStatus, setStartTime }: AnimatedTimerProps) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    let interval: any;
    if (status === 'running') {
      // If we don't have a start time, set it now
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }

      interval = setInterval(() => {
        if (startTimeRef.current) {
          const elapsedTime = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
          setTime(elapsedTime);
        }
      }, 1000);

      // Fade-in animation when starting
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade-out animation when stopping
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [status, fadeAnim, setTime]);

  const handleStartWorkout = () => {
    startTimeRef.current = new Date();
    setStatus('running');
    setStartTime(startTimeRef.current);
  };

  const confirmFinish = () => {
    Alert.alert(
      'Finish Workout?',
      'Are you sure you want to end your workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish', onPress: () => {
          setStatus('idle');
          startTimeRef.current = null;
          onStop();
        }},
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className='justify-center items-center'>
      <Animated.Text
        className='text-[5rem] font-bold p-8' 
        style={{
            opacity: fadeAnim,
            color: theme.text
          }}
      >
        {formatTime(time)}
      </Animated.Text>
      
      {status === 'idle' ? (
        <Button 
          className='w-[90%]'
          onPress={handleStartWorkout}>
          <TextUI>Start Workout</TextUI>
        </Button>
      ) : (
        <View className='flex-row gap-4'>
          <TouchableOpacity
            onPress={confirmFinish}
          >
            <Square size={40} color={theme.text} strokeWidth={1} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AnimatedTimer;