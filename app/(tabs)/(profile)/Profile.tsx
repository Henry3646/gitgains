import { View } from 'react-native'
import React from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Moon, Sun } from 'lucide-react-native'
import { ThemeToggle } from '~/components/ThemeToggle'
import { H2 } from '~/components/ui/typography'

const Profile = () => {
  const { colorScheme, setColorScheme } = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className=' mt-14 h-full w-full'>
      <View className='absolute top-0 right-0 mr-6 mt-6 z-10'>
        <ThemeToggle />
      </View>
      <H2 className='ml-[5%] pt-2'>Profile</H2>
      <Text className='p-[5%]'>More personalized   tracking features coming soon! </Text>
    </View>
  )
}

export default Profile