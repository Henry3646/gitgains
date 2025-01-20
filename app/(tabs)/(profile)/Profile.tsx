import { View } from 'react-native'
import React from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Moon, Sun } from 'lucide-react-native'
import { ThemeToggle } from '~/components/ThemeToggle'

const Profile = () => {
  const { colorScheme, setColorScheme } = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View>
      <Text>Profile</Text>
      <ThemeToggle />
    </View>
  )
}

export default Profile