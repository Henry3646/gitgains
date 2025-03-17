import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Text } from '~/components/ui/text'
import { H1 } from '~/components/ui/typography'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { supabase } from '~/lib/supabase'
import { useRouter } from 'expo-router'

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      
      // On successful auth, the _layout.tsx in the root will handle navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
    >
      <View className='flex-1 justify-center px-4'>
        <View className='mb-8'>
          <H1 className='text-center mb-2'>gitGains</H1>
          <Text className='text-center text-muted-foreground'>
            Your lifts. Your data. Zero fluff.
          </Text>
        </View>

        {error && (
          <View className='mb-4 p-4 bg-destructive/10 rounded-lg'>
            <Text className='text-destructive text-center'>{error}</Text>
          </View>
        )}

        <View className='gap-2'>
          <Input
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            className='mb-2'
          />
          
          <Input
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className='mb-2'
          />

          <Button
            onPress={handleAuth}
            disabled={loading || !email || !password}
          >
            <Text>{loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}</Text>
          </Button>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            className='py-4'
          >
            <Text className='text-center text-primary'>
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Auth