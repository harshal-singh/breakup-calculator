"use client"

import { Button } from "@/components/ui/button"
import { atom, useAtom } from "jotai"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"

const healingActivities = [
  { id: "gym", label: "Gym 💪" },
  { id: "friends", label: "Meeting Friends 👥" },
  { id: "work", label: "Focusing on Work 💼" },
  { id: "hobby", label: "New Hobby 🎨" },
  { id: "travel", label: "Traveling ✈️" },
  { id: "therapy", label: "Therapy 🧠" },
  { id: "dating", label: "Talking to Girls 💋" },
  { id: "alcohol", label: "Drinking Alcohol 🍺", negative: true },
]

const alcoholPoems = [
  "Amber liquid, false relief, a temporary veil; In morning light, the truth reveals, as healing starts to fail.",
  "Bottles empty, spirits high, but souls sink ever low; The path to healing never lies where bitter waters flow.",
  "What numbs tonight will sting at dawn, a cycle without end; The poison cup that seems a cure becomes your foe, not friend.",
  "Golden drops of sweet escape, a siren's deadly song; What dulls the pain today creates a tomorrow twice as long.",
  "In glasses deep and nights too long, we search for what's not there; True healing never comes from what we pour to drown despair.",
  "The liquid courage in your glass, a thief of time and health; Recovery demands the strength to find yourself in self.",
  "Spirits lift when spirits flow, or so the lie is told; But chains of glass hold tighter still than any heart can hold.",
]

const formSchema = z.object({
  breakupDate: z.date({
    required_error: "Please select the breakup date.",
  }),
  relationshipDuration: z.number().min(0).max(600),
  emotionalImpact: z.number().min(0).max(100),
  activities: z.array(z.string()).optional(),
})

const recoveryPercentageAtom = atom(0)

export default function Home() {
  const [recoveryPercentage, setRecoveryPercentage] = useAtom(recoveryPercentageAtom)
  const [sliderValue, setSliderValue] = useState(50)
  const [bgColor, setBgColor] = useState("bg-white")
  const [textColor, setTextColor] = useState("text-black")
  const [emoji, setEmoji] = useState("💔")
  const [showAlcoholPoem, setShowAlcoholPoem] = useState(false)
  const [alcoholPoem, setAlcoholPoem] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      relationshipDuration: 0,
      emotionalImpact: 50,
      activities: [],
    },
  })

  useEffect(() => {
    updateUIBasedOnRecovery(recoveryPercentage)
  }, [recoveryPercentage])

  function updateUIBasedOnRecovery(percentage: number) {
    if (percentage < 25) {
      setBgColor("bg-red-50 dark:bg-red-900/20")
      setTextColor("text-red-900 dark:text-red-100")
      setEmoji("😭")
    } else if (percentage < 50) {
      setBgColor("bg-orange-50 dark:bg-orange-900/20")
      setTextColor("text-orange-900 dark:text-orange-100")
      setEmoji("😕")
    } else if (percentage < 75) {
      setBgColor("bg-blue-50 dark:bg-blue-900/20")
      setTextColor("text-blue-900 dark:text-blue-100")
      setEmoji("😊")
    } else {
      setBgColor("bg-green-50 dark:bg-green-900/20")
      setTextColor("text-green-900 dark:text-green-100")
      setEmoji("🥳")
    }
  }

  function calculateRecovery(data: z.infer<typeof formSchema>) {
    const today = new Date()
    const timeSinceBreakup = today.getTime() - data.breakupDate.getTime()
    const daysSinceBreakup = Math.floor(timeSinceBreakup / (1000 * 60 * 60 * 24))
    
    // Check if alcohol is selected
    const activities = data.activities || []
    const isAlcoholSelected = activities.includes("alcohol")
    
    // Get positive activities (excluding alcohol)
    const positiveActivities = activities.filter(id => id !== "alcohol")
    
    // Fun formula for recovery calculation
    let recovery = (daysSinceBreakup * 0.5) + // Time heals
      (positiveActivities.length || 0) * 10 + // Activities help
      (100 - data.emotionalImpact) * 0.3 // Lower impact means faster recovery
    
    // Apply negative impact for alcohol
    if (isAlcoholSelected) {
      recovery -= 20 // Alcohol significantly slows recovery
      setShowAlcoholPoem(true)
      setAlcoholPoem(alcoholPoems[Math.floor(Math.random() * alcoholPoems.length)])
    } else {
      setShowAlcoholPoem(false)
    }
    
    recovery = Math.min(Math.max(recovery, 0), 100) // Keep between 0-100%
    setRecoveryPercentage(recovery)
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Ensure breakupDate is set
    if (!data.breakupDate) {
      alert("Please select the breakup date")
      return
    }
    
    calculateRecovery(data)
  }

  function getRecoveryMessage(percentage: number) {
    if (percentage < 25) return "Still in the ice cream and tissues phase 🍦😢"
    if (percentage < 50) return "Making progress! You've stopped checking their Instagram 📱"
    if (percentage < 75) return "Look at you, thriving! Their loss 💅"
    return "Completely over them! Time to write a self-help book 📚✨"
  }

  function getProgressBarColor(percentage: number) {
    if (percentage < 25) return "bg-red-600"
    if (percentage < 50) return "bg-orange-500"
    if (percentage < 75) return "bg-blue-500"
    return "bg-green-600"
  }

  return (
    <div className={`container mx-auto py-10 px-4 min-h-screen ${bgColor} transition-colors duration-500`}>
      <div className={`max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/90 rounded-lg shadow-md p-6 transition-all duration-500`}>
        <div className="mb-6">
          <h1 className={`text-3xl font-bold text-center ${textColor} transition-colors duration-500`}>{emoji} Breakup Recovery Calculator</h1>
        </div>
        <div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium">When did it happen? 📅</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                onChange={(e) => {
                  form.setValue('breakupDate', new Date(e.target.value))
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">How long was the relationship? (months)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                onChange={(e) => form.setValue('relationshipDuration', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Emotional Impact Level 💔</label>
              <div className="flex items-center space-x-2">
                <span className="text-xs">0</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  className="flex-grow"
                  value={sliderValue}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setSliderValue(value)
                    form.setValue('emotionalImpact', value)
                  }}
                />
                <span className="text-xs">100</span>
                <span className="ml-2 text-sm font-medium">{sliderValue}</span>
              </div>
              <p className="text-xs text-gray-500">
                From &quot;I&apos;m fine&quot; (0) to &quot;The world is ending&quot; (100)
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">What are you doing to heal? 🌱</label>
              <p className="text-xs text-gray-500 mb-2">Not selecting any options means you&apos;re not doing anything to recover</p>
              <div className="grid grid-cols-2 gap-4">
                {healingActivities.map((activity) => (
                  <div key={activity.id} className={`flex items-center space-x-2 ${activity.negative ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                    <input
                      type="checkbox"
                      id={activity.id}
                      onChange={(e) => {
                        const currentActivities = form.getValues('activities') || [];
                        if (e.target.checked) {
                          form.setValue('activities', [...currentActivities, activity.id]);
                        } else {
                          form.setValue(
                            'activities',
                            currentActivities.filter((id) => id !== activity.id)
                          );
                        }
                      }}
                    />
                    <label htmlFor={activity.id} className="text-sm">
                      {activity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">Calculate My Recovery</Button>
          </form>

          {recoveryPercentage > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className={`text-xl font-semibold text-center ${textColor} transition-colors duration-500`}>Your Recovery Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`${getProgressBarColor(recoveryPercentage)} h-4 rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${Math.round(recoveryPercentage)}%` }}
                ></div>
              </div>
              <p className={`text-center text-lg ${textColor} transition-colors duration-500`}>
                You are {Math.round(recoveryPercentage)}% over them! {emoji}
              </p>
              <p className={`text-center text-md italic ${textColor} transition-colors duration-500`}>
                {getRecoveryMessage(recoveryPercentage)}
              </p>
              
              {showAlcoholPoem && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-center text-sm italic text-red-800 dark:text-red-200">
                    <span className="font-semibold">How bad alcohol is?</span><br />
                    {alcoholPoem}
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const text = `I&apos;m ${Math.round(recoveryPercentage)}% over my ex! How about you? Try the Breakup Recovery Calculator! 🔗`;
                  navigator.clipboard.writeText(text);
                  alert("Copied to clipboard! Share your progress!");
                }}
              >
                Share Your Progress 🔗
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}