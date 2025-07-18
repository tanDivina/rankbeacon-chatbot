// components/intake-chat.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { intakeFlow, IntakeStep } from '@/lib/intake-questions';
import { Button } from '@/components/ui/button';

// Helper component for the chat bubbles
function ChatBubble({ message, role }: { message: string; role: 'assistant' | 'user' }) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`mx-2 max-w-[80%] rounded-lg px-4 py-2 ${
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
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Start with the first question
  useEffect(() => {
    if (intakeFlow.length > 0) {
      setMessages([{ role: 'assistant', text: intakeFlow[0].question }]);
    }
  }, []);

  const handleAnswer = (answer: string) => {
    const currentQuestion = intakeFlow[currentStep];
    if (!currentQuestion) return;

    // Add user's answer to messages
    setMessages((prev) => [...prev, { role: 'user', text: answer }]);

    // Store the answer
    const newAnswers = { ...answers, [currentQuestion.extractKey]: answer };
    setAnswers(newAnswers);

    // Check if the flow is complete
    const nextStep = currentStep + 1;
    if (nextStep >= intakeFlow.length) {
      setIsComplete(true);
      saveProfile(newAnswers);
    } else {
      // Move to the next question
      setCurrentStep(nextStep);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'assistant', text: intakeFlow[nextStep].question }]);
      }, 500); // Small delay to feel more natural
    }
  };

  const saveProfile = async (finalAnswers: Record<string, string>) => {
    setIsSaving(true);
    const profileName = window.prompt(
      'Last step! Give this content profile a name (e.g., "My Tech Blog", "E-commerce Store")',
      `${finalAnswers.niche} Project`
    );

    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, profileName }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      
      const { profile } = await response.json();
      localStorage.setItem('currentProfileId', profile.id);

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
        {isSaving && <ChatBubble message="Saving your profile..." role="assistant" />}
      </div>
      
      <div className="border-t p-4">
        {isComplete ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold">✅ All set! Your profile is saved.</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              You can now start creating optimized content.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard →
            </Button>
          </div>
        ) : (
          <div>
            {currentQuestion?.type === 'choice' && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {currentQuestion.options?.map((option) => (
                  <Button key={option} variant="outline" onClick={() => handleAnswer(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            )}
            {currentQuestion?.type === 'text' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('answer') as HTMLInputElement;
                  if (input.value.trim()) {
                    handleAnswer(input.value.trim());
                    input.value = '';
                  }
                }}
              >
                <input
                  name="answer"
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full rounded-lg border p-2"
                  autoFocus
                />
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}