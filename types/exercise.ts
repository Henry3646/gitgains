export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
  desc: string | null
  muscle_group?: string | string[]
  user_id?: string
}

export interface Set {
  id: number
  reps: number | null
  weight: number | null
}

export interface ExerciseData {
  id: string
  sets: Set[]
}

export interface ExerciseComponentProps {
  exercise: Exercise
  checked: boolean
  editable: boolean
  orderNumber?: number
  onUpdate?: (updates: Partial<Exercise>) => void
}

export interface ExerciseCardProps {
  exercise: Exercise
  exerciseData: ExerciseData
  handleRepChange: (exerciseId: string, setIndex: number, value: string) => void
  handleWeightChange: (exerciseId: string, setIndex: number, value: string) => void
  status: string
} 