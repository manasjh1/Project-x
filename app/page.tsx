"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, Mic, Play, ArrowRight, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const speakPhrases = [
  "नमस्कार",
  "आप कैसे हैं?",
  "मैं ठीक हूँ।",
  "और आप कैसे हो?",
  "मैं भी ठीक हूँ।",
]

const readVocabulary = [
  { hindi: "नमस्कार", transliteration: "Namaskaar", english: "Hello!" },
  { hindi: "आप कैसे हैं?", transliteration: "Aap kaise hain?", english: "How are you?" },
  { hindi: "शुभ प्रभात!", transliteration: "Shubh prabhaat!", english: "Good morning!" },
  { hindi: "शुभ रात्रि!", transliteration: "Shubh raatri!", english: "Good night!" },
  { hindi: "कृपया", transliteration: "Kripyaa", english: "Please" },
  { hindi: "मैं ठीक हूँ।", transliteration: "Main theek hoon.", english: "I am fine." },
  { hindi: "अच्छा", transliteration: "Achchhaa", english: "Fine!" },
  { hindi: "ठीक", transliteration: "Theek", english: "Fine!" },
  { hindi: "मुझे खुशी हुई!", transliteration: "Mujhe khushee huee!", english: "My pleasure!" },
]

const matchingItems = [
  {
    id: 1,
    hindi: "नमस्कार",
    correctTrans: "Namaskaar",
    correctEng: "Hello",
    transOptions: ["Shubh prabhaat", "Namaskaar", "Dhanyavaad", "Theek hai"],
    engOptions: ["Good morning", "Hello", "Thank you", "Fine"],
  },
  {
    id: 2,
    hindi: "आप कैसे हैं?",
    correctTrans: "Aap kaise hain?",
    correctEng: "How are you?",
    transOptions: ["Aap kaise hain?", "Main theek hoon", "Namaskaar", "Kripyaa"],
    engOptions: ["I am fine", "How are you?", "Please", "Hello"],
  },
  {
    id: 3,
    hindi: "शुभ प्रभात",
    correctTrans: "Shubh prabhaat",
    correctEng: "Good morning",
    transOptions: ["Shubh raatri", "Dhanyavaad", "Shubh prabhaat", "Theek hai"],
    engOptions: ["Good night", "Good morning", "Thank you", "Fine"],
  },
  {
    id: 4,
    hindi: "ठीक है",
    correctTrans: "Theek hai",
    correctEng: "Fine / Okay",
    transOptions: ["Namaskaar", "Achchhaa", "Theek hai", "Kripyaa"],
    engOptions: ["Hello", "Good", "Fine / Okay", "Please"],
  },
  {
    id: 5,
    hindi: "धन्यवाद",
    correctTrans: "Dhanyavaad",
    correctEng: "Thank you",
    transOptions: ["Dhanyavaad", "Namaskaar", "Shubh prabhaat", "Main theek hoon"],
    engOptions: ["Thank you", "Hello", "Good morning", "I am fine"],
  },
]

const quizQuestions = [
  {
    id: 1,
    question: "How do you greet someone?",
    options: [
      { id: "q1a", hindi: "नमस्कार", transliteration: "Namaskaar" },
      { id: "q1b", hindi: "ठीक", transliteration: "Theek" },
      { id: "q1c", hindi: "धन्यवाद", transliteration: "Dhanyavaad" },
      { id: "q1d", hindi: "अच्छा", transliteration: "Achchha" },
    ],
    correctId: "q1a",
  },
  {
    id: 2,
    question: "How do you say 'Thanks'?",
    options: [
      { id: "q2a", hindi: "शुभ प्रभात", transliteration: "Shubh Prabhaat" },
      { id: "q2b", hindi: "धन्यवाद", transliteration: "Dhanyavaad" },
      { id: "q2c", hindi: "नमस्कार", transliteration: "Namaskaar" },
      { id: "q2d", hindi: "ठीक है", transliteration: "Theek hai" },
    ],
    correctId: "q2b",
  },
  {
    id: 3,
    question: "How do you say 'Good night'?",
    options: [
      { id: "q3a", hindi: "शुभ प्रभात", transliteration: "Shubh prabhaat" },
      { id: "q3b", hindi: "कृपया", transliteration: "Kripyaa" },
      { id: "q3c", hindi: "शुभ रात्रि", transliteration: "Shubh raatri" },
      { id: "q3d", hindi: "अच्छा", transliteration: "Achchha" },
    ],
    correctId: "q3c",
  },
]

export default function LanguageLearningApp() {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [userName, setUserName] = useState("")
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [hasSpoken, setHasSpoken] = useState(false)
  
  // Match exercise state - one per page
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [selectedTrans, setSelectedTrans] = useState<string | null>(null)
  const [selectedEng, setSelectedEng] = useState<string | null>(null)
  const [showMatchFeedback, setShowMatchFeedback] = useState(false)
  
  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [showQuizFeedback, setShowQuizFeedback] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  const nextScreen = () => {
    if (currentScreen < 9) {
      setCurrentScreen(currentScreen + 1)
    }
  }

  const handleNameSubmit = () => {
    if (userName.trim()) {
      nextScreen()
    }
  }

  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "hi-IN"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleTrySpeak = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      setHasSpoken(true)
    }, 2000)
  }

  const handleNextPhrase = () => {
    if (currentPhraseIndex < speakPhrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1)
      setHasSpoken(false)
    } else {
      nextScreen()
    }
  }

  const handleNextCard = () => {
    if (currentCardIndex < readVocabulary.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  // Match exercise - one per page
  const currentMatch = matchingItems[currentMatchIndex]
  
  const checkCurrentMatch = () => {
    setShowMatchFeedback(true)
  }

  const handleNextMatch = () => {
    if (currentMatchIndex < matchingItems.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1)
      setSelectedTrans(null)
      setSelectedEng(null)
      setShowMatchFeedback(false)
    } else {
      nextScreen()
    }
  }

  const isTransCorrect = selectedTrans === currentMatch?.correctTrans
  const isEngCorrect = selectedEng === currentMatch?.correctEng

  const handleQuizAnswer = (optionId: string) => {
    if (showQuizFeedback) return
    setQuizAnswers((prev) => ({
      ...prev,
      [quizQuestions[currentQuizIndex].id]: optionId,
    }))
    setShowQuizFeedback(true)
  }

  const handleNextQuiz = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setShowQuizFeedback(false)
    } else {
      nextScreen()
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 safe-area-inset">
      <AnimatePresence mode="wait">
        {/* Screen 1: Welcome */}
        {currentScreen === 1 && (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h1 className="text-4xl font-light tracking-tight text-foreground mb-4">
              Welcome
            </h1>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed px-2">
              Begin your journey into the beautiful world of Indian languages
            </p>
            <Button
              onClick={nextScreen}
              size="lg"
              className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
            >
              Begin
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Screen 2: Namaste */}
        {currentScreen === 2 && (
          <motion.div
            key="namaste"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl font-light text-primary mb-3"
            >
              नमस्ते
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xl text-muted-foreground italic mb-10"
            >
              Namaste
            </motion.p>
            <Button
              onClick={nextScreen}
              size="lg"
              className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Screen 3: Name Input */}
        {currentScreen === 3 && (
          <motion.div
            key="name-input"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              What is your name?
            </h2>
            <p className="text-muted-foreground mb-6">
              आपका नाम क्या है?
            </p>
            <div className="space-y-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter your name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                className="text-center text-lg py-6 border-2 border-border bg-card focus:border-primary rounded-xl"
              />
              <Button
                onClick={handleNameSubmit}
                disabled={!userName.trim()}
                size="lg"
                className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Screen 4: Introduction */}
        {currentScreen === 4 && (
          <motion.div
            key="introduction"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-light text-primary mb-6"
            >
              Hello {userName}!
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-5 shadow-sm border border-border text-left"
            >
              <p className="text-base text-foreground leading-relaxed">
                Here we learn languages by exploring our surroundings, family, and relations.
              </p>
              <p className="text-base text-foreground leading-relaxed mt-3">
                Learning another language helps us connect with another culture. Let us learn <span className="font-medium text-primary">Bharatiya Bhasha</span>.
              </p>
            </motion.div>
            <Button
              onClick={nextScreen}
              size="lg"
              className="w-full mt-6 py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
            >
              {"Let's Begin"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Screen 5: Let Us Listen */}
        {currentScreen === 5 && (
          <motion.div
            key="listen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              Let Us Listen
            </h2>
            <p className="text-muted-foreground mb-6">सुनें</p>
            
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster ="/placeholder.jpg"
                >
                  <source src="Project x/Video 1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <Button
              onClick={nextScreen}
              size="lg"
              className="w-full mt-6 py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Screen 6: Let Us Speak */}
        {currentScreen === 6 && (
          <motion.div
            key="speak"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              Let Us Speak
            </h2>
            <p className="text-muted-foreground mb-6">बोलें</p>

            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
              <div className="mb-2 text-sm text-muted-foreground">
                {currentPhraseIndex + 1} / {speakPhrases.length}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhraseIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-6"
                >
                  <h3 className="text-3xl font-light text-primary">
                    {speakPhrases[currentPhraseIndex]}
                  </h3>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-5 mt-4">
                <button
                  onClick={() => playPronunciation(speakPhrases[currentPhraseIndex])}
                  className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center active:scale-95 transition-transform bg-card"
                >
                  <Volume2 className="h-6 w-6 text-foreground" />
                </button>

                <button
                  onClick={handleTrySpeak}
                  disabled={isListening}
                  className={`w-18 h-18 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                    isListening
                      ? "bg-accent animate-pulse"
                      : hasSpoken
                      ? "bg-accent"
                      : "bg-primary"
                  }`}
                  style={{ width: 72, height: 72 }}
                >
                  <Mic className="h-8 w-8 text-primary-foreground" />
                </button>
              </div>

              {isListening && (
                <p className="mt-4 text-accent font-medium animate-pulse">
                  Listening...
                </p>
              )}

              {hasSpoken && !isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="text-accent font-medium mb-4">Well done!</p>
                  <Button
                    onClick={handleNextPhrase}
                    className="rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
                  >
                    {currentPhraseIndex < speakPhrases.length - 1
                      ? "Next Phrase"
                      : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="mt-5 flex justify-center gap-1.5">
              {speakPhrases.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentPhraseIndex
                      ? "bg-primary w-5"
                      : index < currentPhraseIndex
                      ? "bg-accent w-1.5"
                      : "bg-border w-1.5"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Screen 7: Let Us Read */}
        {currentScreen === 7 && (
          <motion.div
            key="read"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              Let Us Read
            </h2>
            <p className="text-muted-foreground mb-6">पढ़ें</p>

            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border min-h-[280px] flex flex-col justify-center">
              <div className="mb-3 text-sm text-muted-foreground">
                {currentCardIndex + 1} / {readVocabulary.length}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="py-4"
                >
                  <h3 className="text-3xl font-light text-primary mb-2">
                    {readVocabulary[currentCardIndex].hindi}
                  </h3>
                  <p className="text-lg text-foreground/70 italic mb-1">
                    {readVocabulary[currentCardIndex].transliteration}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {readVocabulary[currentCardIndex].english}
                  </p>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={() => playPronunciation(readVocabulary[currentCardIndex].hindi)}
                className="mx-auto mt-3 px-5 py-2.5 rounded-full border border-border flex items-center gap-2 active:scale-95 transition-transform bg-card"
              >
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Listen</span>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="w-11 h-11 rounded-full border border-border flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 bg-card"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-1">
                {readVocabulary.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCardIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentCardIndex
                        ? "bg-primary w-5"
                        : "bg-border w-1.5"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextCard}
                disabled={currentCardIndex === readVocabulary.length - 1}
                className="w-11 h-11 rounded-full border border-border flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 bg-card"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {currentCardIndex === readVocabulary.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5"
              >
                <Button
                  onClick={nextScreen}
                  size="lg"
                  className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Screen 8: Let Us Match - One per page */}
        {currentScreen === 8 && (
          <motion.div
            key="match"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              Let Us Match
            </h2>
            <p className="text-muted-foreground mb-5">
              {currentMatchIndex + 1} / {matchingItems.length}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentMatchIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  {/* Hindi word to match */}
                  <div className="bg-primary/10 rounded-xl p-5 mb-6">
                    <p className="text-3xl text-primary font-light">
                      {currentMatch.hindi}
                    </p>
                  </div>

                  {/* Transliteration selection */}
                  <div className="mb-5">
                    <p className="text-sm text-muted-foreground mb-3 text-left">Select transliteration:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {currentMatch.transOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => !showMatchFeedback && setSelectedTrans(option)}
                          disabled={showMatchFeedback}
                          className={`rounded-xl p-3 text-sm transition-all active:scale-98 ${
                            showMatchFeedback
                              ? option === currentMatch.correctTrans
                                ? "bg-accent/20 border-2 border-accent"
                                : selectedTrans === option
                                ? "bg-destructive/10 border-2 border-destructive"
                                : "bg-secondary border-2 border-transparent"
                              : selectedTrans === option
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-secondary border-2 border-transparent"
                          }`}
                        >
                          {option}
                          {showMatchFeedback && option === currentMatch.correctTrans && (
                            <Check className="inline-block ml-1 h-3 w-3 text-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* English selection */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 text-left">Select English meaning:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {currentMatch.engOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => !showMatchFeedback && setSelectedEng(option)}
                          disabled={showMatchFeedback}
                          className={`rounded-xl p-3 text-sm transition-all active:scale-98 ${
                            showMatchFeedback
                              ? option === currentMatch.correctEng
                                ? "bg-accent/20 border-2 border-accent"
                                : selectedEng === option
                                ? "bg-destructive/10 border-2 border-destructive"
                                : "bg-secondary border-2 border-transparent"
                              : selectedEng === option
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-secondary border-2 border-transparent"
                          }`}
                        >
                          {option}
                          {showMatchFeedback && option === currentMatch.correctEng && (
                            <Check className="inline-block ml-1 h-3 w-3 text-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  {showMatchFeedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-5 font-medium ${
                        isTransCorrect && isEngCorrect
                          ? "text-accent"
                          : "text-destructive"
                      }`}
                    >
                      {isTransCorrect && isEngCorrect
                        ? "Both correct!"
                        : isTransCorrect
                        ? "Transliteration correct, check English."
                        : isEngCorrect
                        ? "English correct, check transliteration."
                        : "Try again next time!"}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="mt-5 flex justify-center gap-1.5">
              {matchingItems.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentMatchIndex
                      ? "bg-primary w-5"
                      : index < currentMatchIndex
                      ? "bg-accent w-1.5"
                      : "bg-border w-1.5"
                  }`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-5">
              {!showMatchFeedback ? (
                <Button
                  onClick={checkCurrentMatch}
                  disabled={!selectedTrans || !selectedEng}
                  size="lg"
                  className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform disabled:opacity-50"
                >
                  Check
                </Button>
              ) : (
                <Button
                  onClick={handleNextMatch}
                  size="lg"
                  className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
                >
                  {currentMatchIndex < matchingItems.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    "Continue to Quiz"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Screen 9: Quiz - Tap to answer */}
        {currentScreen === 9 && (
          <motion.div
            key="quiz"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-sm"
          >
            <h2 className="text-2xl font-light text-foreground mb-1">
              Quiz Time
            </h2>
            <p className="text-muted-foreground mb-5">
              {currentQuizIndex + 1} / {quizQuestions.length}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuizIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  <p className="text-lg text-foreground mb-6 leading-relaxed">
                    {quizQuestions[currentQuizIndex].question}
                  </p>

                  {/* Options - tap to select */}
                  <div className="space-y-2.5">
                    {quizQuestions[currentQuizIndex].options.map((option) => {
                      const isSelected = quizAnswers[quizQuestions[currentQuizIndex].id] === option.id
                      const isCorrect = option.id === quizQuestions[currentQuizIndex].correctId
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleQuizAnswer(option.id)}
                          disabled={showQuizFeedback}
                          className={`w-full rounded-xl p-4 text-center transition-all active:scale-98 ${
                            showQuizFeedback
                              ? isCorrect
                                ? "bg-accent/20 border-2 border-accent"
                                : isSelected
                                ? "bg-destructive/10 border-2 border-destructive"
                                : "bg-secondary border-2 border-transparent"
                              : isSelected
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-secondary border-2 border-transparent"
                          }`}
                        >
                          <span className="text-xl block mb-0.5">{option.hindi}</span>
                          <span className="text-sm text-muted-foreground">{option.transliteration}</span>
                          {showQuizFeedback && isCorrect && (
                            <Check className="inline-block ml-2 h-4 w-4 text-accent" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {showQuizFeedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 font-medium ${
                        quizAnswers[quizQuestions[currentQuizIndex].id] === quizQuestions[currentQuizIndex].correctId
                          ? "text-accent"
                          : "text-destructive"
                      }`}
                    >
                      {quizAnswers[quizQuestions[currentQuizIndex].id] === quizQuestions[currentQuizIndex].correctId
                        ? "Correct!"
                        : "Not quite. Try again next time!"}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex justify-center gap-1.5">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentQuizIndex
                      ? "bg-primary w-5"
                      : index < currentQuizIndex
                      ? "bg-accent w-1.5"
                      : "bg-border w-1.5"
                  }`}
                />
              ))}
            </div>

            {showQuizFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5"
              >
                <Button
                  onClick={handleNextQuiz}
                  size="lg"
                  className="w-full py-6 text-lg rounded-2xl bg-primary text-primary-foreground active:scale-98 transition-transform"
                >
                  {currentQuizIndex < quizQuestions.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    "Complete"
                  )}
                </Button>
              </motion.div>
            )}

            {/* Final completion */}
            {currentQuizIndex === quizQuestions.length - 1 &&
              showQuizFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 p-5 bg-accent/10 rounded-2xl border border-accent/20"
                >
                  <p className="text-lg text-foreground font-medium mb-1">
                    Congratulations, {userName || "Learner"}!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {"You've completed this unit!"}
                  </p>
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
