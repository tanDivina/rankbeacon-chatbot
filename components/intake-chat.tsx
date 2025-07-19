// components/intake-chat.tsx

'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { intakeFlow } from '@/lib/intake-questions';
import { Button } from '@/components/ui/button';

// Helper component for the chat bubbles (no changes needed here)
function ChatBubble({ message, role }: { message: string; role: 'assistant' | 'user' }) {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`mx-2 max-w-[80%] break-words rounded-lg px-4 py-2 ${
          isUser
            ? 'rounded-br-none bg-blue-600 text-white'
            : 'rounded-bl-none bg-gray-200 text-gray-800'
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export function IntakeChat() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isValidating]);

  // Start with the first question
  useEffect(() => {
    if (intakeFlow.length > 0) {
      setMessages([{ role: 'assistant', text: intakeFlow[0].question }]);
    }
  }, []);

  // Main handler for user input
  const handleAnswer = async (answer: string) => {
    const currentQuestion = intakeFlow[currentStep];
    if (!currentQuestion || isValidating || isSaving) return;

    // For simple choice questions, no validation is needed
    if (currentQuestion.type === 'choice') {
      setMessages((prev) => [...prev, { role: 'user', text: answer }]);
      storeAndProceed(answer);
      return;
    }

    // For text inputs, call our AI validation API
    setIsValidating(true);
    try {
      const response = await fetch('/api/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: answer,
        }),
      });

      if (!response.ok) throw new Error('Validation request failed');

      const { validationResult } = await response.json();

      // If the response doesn't end with a question mark, it's an acknowledgment
      if (!validationResult.trim().endsWith('?')) {
        // AI gave a positive acknowledgment! Just show user message and proceed.
        setMessages((prev) => [
          ...prev, 
          { role: 'user', text: answer }
          // Don't show the "Perfect!", "Great!", etc. - it's just for internal logic
        ]);
        setInputValue('');
        storeAndProceed(answer);
      } else {
        // AI returned a follow-up question. Display it.
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: answer },
          { role: 'assistant', text: validationResult },
        ]);
        setInputValue(''); // Clear the input for the user's next attempt
      }
    } catch (error) {
      console.error(error);
      alert('Sorry, an error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Helper function to store the answer and continue the flow
  
  const storeAndProceed = (answer: string) => {
    const currentQuestion = intakeFlow[currentStep];
    const newAnswers = { ...answers, [currentQuestion.extractKey]: answer };
    setAnswers(newAnswers);
  
    const reply = currentQuestion.personalizedReplies?.[answer] || currentQuestion.personalizedReplies?.['default'];
  
    if (reply) {
      // First show the personalized reply
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        // Then proceed to next question after a delay
        setTimeout(() => {
          proceedToNextStep(newAnswers);
        }, 1500); // Give time to read the personalized reply
      }, 750);
    } else {
      // If no personalized reply, just proceed
      setTimeout(() => {
        proceedToNextStep(newAnswers);
      }, 500);
    }
  };

  const proceedToNextStep = (currentAnswers: Record<string, string>) => {
    const nextStepIndex = currentStep + 1;

    if (nextStepIndex >= intakeFlow.length) {
      setIsComplete(true);
      setTimeout(() => saveProfile(currentAnswers), 1000);
    } else {
      setCurrentStep(nextStepIndex);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: intakeFlow[nextStepIndex].question }]);
      }, 500);
    }
  };

  const saveProfile = async (finalAnswers: Record<string, string>) => {
    setMessages((prev) => [...prev, { role: 'assistant', text: "Perfect, thank you! Let's get a name for this profile..." }]);
    setIsSaving(true);
    const profileName = window.prompt(
      'Last step! Give this content profile a name (e.g., "My Tech Blog")',
      `${finalAnswers.niche} Project`
    );

    try {
      if (!profileName) throw new Error("Profile name cancelled.");
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, profileName }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      const { profile } = await response.json();
      localStorage.setItem('currentProfileId', profile.id);
   // ADD THIS: Redirect to external app after successful save
    setTimeout(() => {
      window.location.href = 'https://app.rankbeacon.dev';
    }, 1500);
    
  } catch (error) {
    console.error(error);
    alert('There was an error saving your profile. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

  const currentQuestion = intakeFlow[currentStep];

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg.text} role={msg.role} />
        ))}
        {isValidating && <ChatBubble message="Hmm, let me see..." role="assistant" />}
      </div>

      <div className="border-t p-4">
        {isComplete && !isSaving ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold">✅ All set! Your profile is saved.</h3>
            <p className="text-muted-foreground mb-4 text-sm">You can now start creating optimized content.</p>
            <Button onClick={() => window.location.href = 'https://app.rankbeacon.dev'} className="w-full">
              Go to the RankBeacon App →
            </Button>
          </div>
        ) : (
          <div className={isValidating ? 'pointer-events-none opacity-50' : ''}>
            {currentQuestion?.type === 'choice' && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {currentQuestion.options?.map((option) => (
                  <Button key={option} variant="outline" onClick={() => handleAnswer(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            )}
            {(currentQuestion?.type === 'text' || currentQuestion?.type === 'text-with-suggestions') && (
              <div>
                {currentQuestion.type === 'text-with-suggestions' && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {currentQuestion.suggestions?.map((suggestion) => (
                      <Button key={suggestion} variant="outline" size="sm" className="text-xs" onClick={() => setInputValue(suggestion)}>
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      handleAnswer(inputValue.trim());
                    }
                  }}
                >
                  <input
                    name="answer"
                    type="text"
                    placeholder="Type your answer here..."
                    className="w-full rounded-lg border p-2"
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}