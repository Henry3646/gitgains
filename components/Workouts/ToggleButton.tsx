import { View } from 'react-native'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import { Text } from '~/components/ui/text'

const ToggleButton = ({name, setState }: {name: string, state: any, setState: any}) => {
    const [isActive, setIsActive] = React.useState(false)
  
    const handlePress = () => {
      setIsActive(!isActive)
      setState()
    }
    return (
    <Button onPress={handlePress} className='w-[30%]' variant={isActive ? 'default' : 'outline'}>
        <Text>{name}</Text>
    </Button>
  )
}

export default ToggleButton