import { View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { Text } from '~/components/ui/text'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '~/components/ui/card'
import { useColorScheme } from '~/lib/useColorScheme'
import { NAV_THEME } from '~/lib/constants'
import { Ellipsis } from 'lucide-react-native'
import { Badge } from '~/components/ui/badge'
import { SquareCheck, Square } from 'lucide-react-native'

const ExerciseComponent = ({exercise, checked, editable}: {exercise: any, checked: any, editable: any}) => {
    const { isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    const [included, setIncluded] = React.useState(false);

    useEffect(() => {
        if (!editable) {
            let check = false
            checked.forEach((e: any) => {
                if (e.id === exercise.id) {
                    check = true
                    setIncluded(true)
                }
            })
            if (!check) {
                setIncluded(false)
            }
        }
    }, [checked]);
  return (
    <Card className='w-[100%]'>
            <CardHeader className='pb-0'>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription numberOfLines={1} ellipsizeMode='tail' className='w-[80%]'>{exercise.desc}</CardDescription>
            </CardHeader>
            <CardContent>
                <View className='flex-row mb-2'>
                    {exercise.muscle_group?.map((group: any) => (
                        <Badge key={group} className='mr-4'>
                            <Text>{group}</Text>
                        </Badge>
                    ))}
                </View>
                <View className='flex-row'>
                    <Badge className='mr-4' >
                        <Text>{exercise.sets} sets</Text>
                    </Badge>
                    <Badge className='mr-4'>
                        <Text>{exercise.reps} reps</Text>
                    </Badge>
                </View>
            </CardContent>
            {editable ? (
                <View className='absolute justify-center top-2 right-4'>
                    <TouchableOpacity onPress={() => console.log(checked)}>
                        <Ellipsis size={30} color={theme.text} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View className='absolute right-4 justify-center h-full'>
                {included ? <SquareCheck size={50} color={theme.text} /> : <Square size={50} color={theme.text} />}
                </View>
            )}
        </Card>
  )
}

export default ExerciseComponent