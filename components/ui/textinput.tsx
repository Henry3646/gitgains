import React from 'react'
import { TextInput as RNTextInput, TextInputProps } from 'react-native'
import { cn } from '~/lib/utils'

interface Props extends TextInputProps {
  className?: string
}

export const TextInput = React.forwardRef<RNTextInput, Props>(
  ({ className, ...props }, ref) => {
    return (
      <RNTextInput
        ref={ref}
        className={cn(
          'h-10 px-3 py-2 text-sm bg-background border border-input rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'placeholder:text-muted-foreground',
          className
        )}
        {...props}
      />
    )
  }
)

TextInput.displayName = 'TextInput' 