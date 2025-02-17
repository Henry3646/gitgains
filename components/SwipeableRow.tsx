import React from 'react'
import { View } from 'react-native'
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/Swipeable' // Standard Swipeable
import Animated from 'react-native-reanimated' // For Animated components
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Text } from '~/components/ui/text'

const SwipeableRow = ({ children, onEdit, onDelete }: { children: any; onEdit: () => void; onDelete: () => void }) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light

  // Wrap actions in Animated.View to work with Reanimated
  const renderRightActions = () => (
    <Animated.View className='flex-row items-center'>
      <RectButton
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 50,
          height: '100%',
          backgroundColor: theme.text,
        }}
        onPress={onEdit}
      >
        <Text className='font-bold' style={{ color: theme.card }}>
          Edit
        </Text>
      </RectButton>
      <RectButton
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 50,
          height: '100%',
          backgroundColor: theme.notification,
          borderBottomRightRadius: 14,
          borderTopRightRadius: 14,
        }}
        onPress={onDelete}
      >
        <Text className='font-bold'>Delete</Text>
      </RectButton>
    </Animated.View>
  )

  return (
    <GestureHandlerRootView className='w-[90%] mb-4 rounded-[14] flex-1' style={{ backgroundColor: theme.card }}>
      {/* Use standard Swipeable but ensure child components use Animated */}
      <Swipeable renderRightActions={renderRightActions}>{children}</Swipeable>
    </GestureHandlerRootView>
  )
}

export default SwipeableRow