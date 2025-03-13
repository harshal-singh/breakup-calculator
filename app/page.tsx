"use client"

import { Button } from "@/components/ui/button"
import { atom, useAtom } from "jotai"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Moon, Sun, Save, Share2, Trash2, Info } from "lucide-react"
import { format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ClientOnly from "@/components/client-only"
import dynamic from "next/dynamic"

// Dynamically import framer-motion with SSR disabled to prevent hydration errors
const motion = {
  div: dynamic(() => import("framer-motion").then(mod => mod.motion.div), { ssr: false }),
  h1: dynamic(() => import("framer-motion").then(mod => mod.motion.h1), { ssr: false })
}

const healingActivities = [
  { id: "gym", label: "Gym 💪", description: "Physical exercise releases endorphins that boost mood" },
  { id: "friends", label: "Meeting Friends 👥", description: "Social connections help rebuild your support network" },
  { id: "work", label: "Focusing on Work 💼", description: "Channeling energy into career growth provides purpose" },
  { id: "hobby", label: "New Hobby 🎨", description: "Learning new skills builds confidence and identity" },
  { id: "travel", label: "Traveling ✈️", description: "New environments create fresh perspectives" },
  { id: "therapy", label: "Therapy 🧠", description: "Professional guidance helps process emotions" },
  { id: "dating", label: "Talking to Girls 💋", description: "Meeting new people helps you move forward" },
  { id: "alcohol", label: "Drinking Alcohol 🍺", negative: true, description: "Temporary relief but hinders emotional processing" },
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
const darkModeAtom = atom(false)

// Type for saved progress
type SavedProgress = {
  id: string;
  date: string;
  recoveryPercentage: number;
  formData: z.infer<typeof formSchema>;
}

export default function Home() {
  const [recoveryPercentage, setRecoveryPercentage] = useAtom(recoveryPercentageAtom)
  const [darkMode, setDarkMode] = useAtom(darkModeAtom)
  const [sliderValue, setSliderValue] = useState(50)
  const [bgColor, setBgColor] = useState("bg-white")
  const [textColor, setTextColor] = useState("text-black")
  const [emoji, setEmoji] = useState("💔")
  const [showAlcoholPoem, setShowAlcoholPoem] = useState(false)
  const [alcoholPoem, setAlcoholPoem] = useState("")
  const [savedProgresses, setSavedProgresses] = useState<SavedProgress[]>([])
  const [showInsights, setShowInsights] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      relationshipDuration: 0,
      emotionalImpact: 50,
      activities: [],
    },
  })

  // Load saved progresses and dark mode preference from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('savedProgresses')
    if (savedData) {
      setSavedProgresses(JSON.parse(savedData))
    }
    
    const darkModePref = localStorage.getItem('darkMode')
    if (darkModePref) {
      setDarkMode(darkModePref === 'true')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
  }, [setDarkMode])

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

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
    
    // Get activities
    const activities = data.activities || []
    const isAlcoholSelected = activities.includes("alcohol")
    const positiveActivities = activities.filter(id => id !== "alcohol")
    
    // 1. Time Factor (40% max) - Non-linear time healing
    // First month: rapid recovery
    // 2-6 months: steady recovery
    // After 6 months: diminishing returns
    let timeRecoveryFactor = 0
    if (daysSinceBreakup <= 30) {
      // First month: Quick initial recovery
      timeRecoveryFactor = (daysSinceBreakup / 30) * 20 // Up to 20%
    } else if (daysSinceBreakup <= 180) {
      // 2-6 months: Steady recovery
      timeRecoveryFactor = 20 + ((daysSinceBreakup - 30) / 150) * 15 // Additional 15%
    } else {
      // After 6 months: Diminishing returns
      timeRecoveryFactor = 35 + Math.min((daysSinceBreakup - 180) / 180, 1) * 5 // Final 5%
    }
    
    // 2. Emotional Impact Factor (30% max)
    // Higher emotional impact = slower recovery
    // Non-linear scale to better reflect real emotional processing
    const normalizedImpact = data.emotionalImpact / 100
    const emotionalRecoveryFactor = 30 * (1 - Math.pow(normalizedImpact, 0.7))
    
    // 3. Activities Factor (20% max)
    // Each activity contributes, but with diminishing returns
    // First activities have more impact than later ones
    const activityCount = positiveActivities.length
    const activityRecoveryFactor = activityCount === 0 
      ? 0 
      : Math.min(20, activityCount * 5) // Each activity adds 5%, up to 20%
    
    // 4. Relationship Duration Factor (10% max)
    // Short relationships (<3 months): Easier recovery
    // Medium (3-12 months): Moderate recovery
    // Long (>12 months): Harder recovery
    let durationRecoveryFactor = 0
    if (data.relationshipDuration <= 3) {
      durationRecoveryFactor = 10 // Short relationships are easier to recover from
    } else if (data.relationshipDuration <= 12) {
      durationRecoveryFactor = 10 - ((data.relationshipDuration - 3) / 9) * 5 // Gradually decreases
    } else {
      durationRecoveryFactor = 5 - Math.min((data.relationshipDuration - 12) / 12, 1) * 5 // Further decreases
    }
    
    // Calculate base recovery
    let recovery = timeRecoveryFactor + emotionalRecoveryFactor + activityRecoveryFactor + durationRecoveryFactor
    
    // Apply alcohol penalty if selected
    if (isAlcoholSelected) {
      const alcoholPenalty = Math.min(20, recovery * 0.3) // 30% reduction, max 20 points
      recovery = Math.max(0, recovery - alcoholPenalty)
      setShowAlcoholPoem(true)
      setAlcoholPoem(alcoholPoems[Math.floor(Math.random() * alcoholPoems.length)])
    } else {
      setShowAlcoholPoem(false)
    }
    
    // Ensure recovery is between 0-100%
    recovery = Math.min(Math.max(recovery, 0), 100)
    
    // Log factors for transparency
    console.log({
      daysSinceBreakup,
      timeRecoveryFactor,
      emotionalRecoveryFactor,
      activityRecoveryFactor,
      durationRecoveryFactor,
      alcoholPenalty: isAlcoholSelected ? 'Applied' : 'None',
      totalRecovery: recovery
    })
    
    setRecoveryPercentage(recovery)
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Ensure breakupDate is set
    if (!data.breakupDate) {
      toast({
        title: "Missing information",
        description: "Please select the breakup date",
        variant: "destructive"
      })
      return
    }
    
    calculateRecovery(data)
    setShowInsights(true)
  }

  function getRecoveryMessage(percentage: number) {
    if (percentage < 25) return "Still in the ice cream and tissues phase 🍦😢"
    if (percentage < 50) return "Making progress! You\'ve stopped checking their Instagram 📱"
    if (percentage < 75) return "Look at you, thriving! Their loss 💅"
    return "Completely over them! Time to write a self-help book 📚✨"
  }

  function getProgressBarColor(percentage: number) {
    if (percentage < 25) return "bg-red-600"
    if (percentage < 50) return "bg-orange-500"
    if (percentage < 75) return "bg-blue-500"
    return "bg-green-600"
  }

  function getCustomAdvice(percentage: number, activities: string[] = []) {
    if (percentage < 25) {
      if (!activities.includes("friends")) {
        return "Consider reaching out to friends. Social support is crucial during early stages of healing."
      }
      return "It\'s okay to feel sad. Allow yourself to process these emotions, but try to limit wallowing to specific times."
    }
    
    if (percentage < 50) {
      if (!activities.includes("hobby")) {
        return "This is a great time to explore a new hobby or rediscover old interests that bring you joy."
      }
      return "You\'re making progress! Try setting small daily goals to keep moving forward."
    }
    
    if (percentage < 75) {
      if (!activities.includes("dating")) {
        return "You might be ready to start meeting new people. No pressure, but keep an open mind."
      }
      return "You\'re doing great! Focus on the positive changes you\'ve made and continue building your independence."
    }
    
    if (!activities.includes("travel")) {
      return "Consider planning a trip to celebrate your healing journey and create new memories."
    }
    return "You\'ve made it! Remember the lessons learned and carry them forward into your next chapter."
  }

  function saveProgress() {
    const formData = form.getValues()
    const newProgress: SavedProgress = {
      id: Date.now().toString(),
      date: format(new Date(), 'PPP'),
      recoveryPercentage,
      formData
    }
    
    const updatedProgresses = [...savedProgresses, newProgress]
    setSavedProgresses(updatedProgresses)
    localStorage.setItem('savedProgresses', JSON.stringify(updatedProgresses))
    
    toast({
      title: "Progress saved!",
      description: "You can track your healing journey over time.",
    })
  }

  function loadProgress(progress: SavedProgress) {
    form.reset(progress.formData)
    setSliderValue(progress.formData.emotionalImpact)
    setRecoveryPercentage(progress.recoveryPercentage)
    
    toast({
      title: "Progress loaded",
      description: `Loaded data from ${progress.date}`,
    })
  }

  function deleteProgress(id: string) {
    const updatedProgresses = savedProgresses.filter(p => p.id !== id)
    setSavedProgresses(updatedProgresses)
    localStorage.setItem('savedProgresses', JSON.stringify(updatedProgresses))
    
    toast({
      title: "Progress deleted",
      description: "Entry has been removed from your history",
    })
  }

  function clearAllProgress() {
    setSavedProgresses([])
    localStorage.removeItem('savedProgresses')
    
    toast({
      title: "All progress cleared",
      description: "Your history has been reset",
    })
  }

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-500 dark:text-white`}>
      <div className="container mx-auto pb-10 px-4">
        <ClientOnly>
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </ClientOnly>
        
        <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/90 rounded-lg shadow-md p-6 transition-all duration-500">
          <div className="mb-6">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl font-bold text-center ${textColor} transition-colors duration-500`}
            >
              {emoji} Breakup Recovery Calculator
            </motion.h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
              Track your healing journey and get personalized insights
            </p>
          </div>
          
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">When did it happen? 📅</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  onChange={(e) => form.setValue('relationshipDuration', Number(e.target.value))}
                />
              </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Emotional Impact Level 💔</label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">0</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  From &quot;I&apos;m fine&quot; (0) to &quot;The world is ending&quot; (100)
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">What are you doing to heal? 🌱</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Not selecting any options means you\&apos;re not doing anything to recover</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  {healingActivities.map((activity) => (
                    <TooltipProvider key={activity.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${activity.negative ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
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
                            <label htmlFor={activity.id} className="text-sm cursor-pointer flex-1">
                              {activity.label}
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{activity.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">Calculate My Recovery</Button>
            </form>

            <ClientOnly>
              {recoveryPercentage > 0 && (
                <div 
                  className="mt-8 space-y-4 overflow-hidden"
                >
                  <h3 className={`text-xl font-semibold text-center ${textColor} transition-colors duration-500`}>Your Recovery Progress</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(recoveryPercentage)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`${getProgressBarColor(recoveryPercentage)} h-4 rounded-full`} 
                    ></motion.div>
                  </div>
                  <p className={`text-center text-lg ${textColor} transition-colors duration-500`}>
                    You are {Math.round(recoveryPercentage)}% over them! {emoji}
                  </p>
                  <p className={`text-center text-md italic ${textColor} transition-colors duration-500`}>
                    {getRecoveryMessage(recoveryPercentage)}
                  </p>
                  
                  {showInsights && (
                    <div
                      className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800"
                    >
                      <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Personal Advice</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {getCustomAdvice(recoveryPercentage, form.getValues('activities'))}
                      </p>
                    </div>
                  )}
                  
                  {showAlcoholPoem && (
                    <div 
                      className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800"
                    >
                      <p className="text-center text-sm italic text-red-800 dark:text-red-200">
                        <span className="font-semibold">How bad alcohol is?</span><br />
                        {alcoholPoem}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={saveProgress}
                    >
                      <Save className="h-4 w-4 mr-2" /> Save Progress
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        const text = `I\'m ${Math.round(recoveryPercentage)}% over my ex! How about you? Try the Breakup Recovery Calculator!`;
                        navigator.clipboard.writeText(text);
                        toast({
                          title: "Copied to clipboard!",
                          description: "Share your progress with friends",
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share Progress
                    </Button>
                  </div>
                </div>
              )}
            </ClientOnly>
            
            {/* Saved Progress Section */}
            <ClientOnly>
              {savedProgresses.length > 0 && (
                <div className="mt-8 border-t pt-6 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Healing Journey</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearAllProgress}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {savedProgresses.map((progress) => (
                      <div 
                        key={progress.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <p className="text-sm font-medium">{progress.date}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Recovery: {Math.round(progress.recoveryPercentage)}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => loadProgress(progress)}
                          >
                            Load
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteProgress(progress.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ClientOnly>
            
            {/* Info Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="mt-6 mx-auto flex items-center gap-2">
                  <Info className="h-4 w-4" /> About This Calculator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About The Breakup Recovery Calculator</DialogTitle>
                  <DialogDescription>
                    This calculator uses a combination of time passed, emotional impact, and healing activities to estimate your recovery progress. While not scientifically validated, it provides a fun way to track your healing journey.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2 text-sm">
                  <p>The formula considers:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Time since breakup (time heals)</li>
                    <li>Emotional impact of the relationship</li>
                    <li>Positive activities you\&apos;re engaging in</li>
                    <li>Relationship duration (some aspects)</li>
                  </ul>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Remember that healing is not linear, and everyone\&apos;s journey is unique.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}