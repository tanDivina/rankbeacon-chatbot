// lib/intake-questions.ts

export interface IntakeStep {
    id: string;
    question: string;
    type: 'text' | 'choice';
    options?: string[];
    extractKey: string;
  }
  
  export const intakeFlow: IntakeStep[] = [
    {
      id: 'project-type',
      question: "Hey there! 👋 To get started, what kind of project are you working on?",
      type: 'choice',
      options: ['Blog / Content Site', 'E-commerce Store', 'SaaS / Product', 'Local Business', 'Other'],
      extractKey: 'projectType'
    },
    {
      id: 'niche',
      question: "Awesome! What is your specific niche or industry? (e.g., 'Vegan cooking', 'B2B marketing software')",
      type: 'text',
      extractKey: 'niche'
    },
    {
      id: 'target-audience',
      question: "Who are you creating this content for? Describe your target audience.",
      type: 'text',
      extractKey: 'targetAudience'
    },
    {
      id: 'content-types',
      question: "What type of content do you create most often?",
      type: 'choice',
      options: ['How-to Guides', 'Product Reviews', 'Listicles / Top 10s', 'Educational Articles'],
      extractKey: 'contentTypes'
    },
    {
      id: 'goals',
      question: "What's your main goal with this content?",
      type: 'choice',
      options: ['Drive Sales', 'Build Brand Authority', 'Generate Leads', 'Educate My Audience'],
      extractKey: 'primaryGoal'
    },
    {
      id: 'voice',
      question: "How do you want your brand to sound?",
      type: 'choice',
      options: ['Professional & Authoritative', 'Friendly & Casual', 'Witty & Humorous', 'Technical & Expert'],
      extractKey: 'brandVoice'
    },
    // --- THIS IS THE NEW STEP WE'VE ADDED ---
    {
      id: 'language',
      question: "Finally, what language will you be creating content in?",
      type: 'choice',
      options: ['English', 'Spanish', 'French', 'German', 'Dutch', 'Portuguese'],
      extractKey: 'language'
    }
  ];