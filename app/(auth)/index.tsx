import { View, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Text } from '~/components/ui/text'
import { H1 } from '~/components/ui/typography'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { supabase } from '~/lib/supabase'
import { useRouter } from 'expo-router'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Dumbbell } from 'lucide-react-native'

const Auth = () => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        
        if (authData.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                user_id: authData.user.id,
                email: email
              }
            ])
          
          if (insertError) throw insertError
        }
        
        setSuccess('Check your email for the confirmation link!')
      }
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
      style={{ backgroundColor: theme.background }}
    >
      <View className='flex-1 justify-center px-6'>
        <View className='items-center mb-8'>
          <H1 className='text-center mb-2'>gitGains</H1>
          <Text className='text-center text-muted-foreground text-base'>
            Your lifts. Your data. Zero fluff.
          </Text>
        </View>

        {error && (
          <View className='mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20'>
            <Text className='text-destructive text-center'>{error}</Text>
          </View>
        )}

        {success && (
          <View className='mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20'>
            <Text className='text-green-500 text-center'>{success}</Text>
          </View>
        )}

        <View className='gap-3'>
          <View>
            <Text className='text-sm font-medium mb-1.5'>Email</Text>
            <Input
              placeholder='Enter your email'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              className='h-12'
            />
          </View>
          
          <View>
            <Text className='text-sm font-medium mb-1.5'>Password</Text>
            <Input
              placeholder='Enter your password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className='h-12'
            />
          </View>

          <Button
            onPress={handleAuth}
            disabled={loading || !email || !password}
            className='h-12 mt-2'
          >
            {loading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text className='font-medium'>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </Button>

          <TouchableOpacity 
            onPress={() => {
              setIsLogin(!isLogin)
              setError(null)
              setSuccess(null)
            }}
            className='py-4'
          >
            <Text className='text-center text-primary font-medium'>
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Auth