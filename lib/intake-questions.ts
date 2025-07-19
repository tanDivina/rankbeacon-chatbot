// lib/intake-questions.ts

export interface IntakeStep {
    id: string;
    question: string;
    type: 'text' | 'choice' | 'text-with-suggestions';
    options?: string[];
    suggestions?: string[];
    extractKey: string;
    personalizedReplies?: Record<string, string>;
  }
  
  export const intakeFlow: IntakeStep[] = [
    {
      id: 'project-type',
      question: "Hey there! 👋 To get started, what kind of project are you working on?",
      type: 'choice',
      options: ['Blog / Content Site', 'E-commerce Store', 'SaaS / Product', 'Local Business', 'Other'],
      extractKey: 'projectType',
      personalizedReplies: {
        'Blog / Content Site': "Awesome, a blogger! Content creators are the heart of the internet. 💖",
        'E-commerce Store': "Nice! E-commerce is where the magic happens. Let's make your products irresistible! ✨",
        'SaaS / Product': "Ooh, a tech innovator! This is going to be fun. 🚀",
        'Local Business': "Supporting local businesses is my jam! Let's put you on the map! 🗺️",
        'Other': "I love a mystery! Tell me more about your unique project! 🎭",
        'default': "Great choice! Let's dive a bit deeper."
      }
    },
    {
      id: 'niche',
      question: "Now, let's get specific - what's your niche or industry? (e.g., 'Vegan cooking', 'B2B marketing software')",
      type: 'text',
      extractKey: 'niche',
      personalizedReplies: {
        'default': "That's a fascinating niche! I can already see the potential. 🌟"
      }
    },
    {
      id: 'target-audience',
      question: "Who are you creating this content for? Describe your target audience.",
      type: 'text-with-suggestions',
      suggestions: [
        'Small business owners',
        'Tech enthusiasts',
        'Health-conscious millennials',
        'DIY hobbyists',
        'Professional developers',
        'Parents',
        'Students',
        'Fitness enthusiasts'
      ],
      extractKey: 'targetAudience',
      personalizedReplies: {
        'default': "Perfect! Understanding your audience is key to great content. 🎯"
      }
    },
    {
      id: 'content-types',
      question: "What type of content do you create most often?",
      type: 'choice',
      options: ['How-to Guides', 'Product Reviews', 'Listicles / Top 10s', 'Educational Articles'],
      extractKey: 'contentTypes',
      personalizedReplies: {
        'How-to Guides': "Love it! How-to guides are super valuable for readers. 📚",
        'Product Reviews': "Smart choice! Honest reviews build trust and drive decisions. ⭐",
        'Listicles / Top 10s': "Listicles are so engaging! People love a good countdown. 📝",
        'Educational Articles': "Educational content positions you as an expert. Great strategy! 🎓",
        'default': "Excellent content strategy!"
      }
    },
    {
      id: 'goals',
      question: "What's your main goal with this content?",
      type: 'choice',
      options: ['Drive Sales', 'Build Brand Authority', 'Generate Leads', 'Educate My Audience'],
      extractKey: 'primaryGoal',
      personalizedReplies: {
        'Drive Sales': "Let's turn those readers into customers! 💰",
        'Build Brand Authority': "Building authority is a smart long-term play. 👑",
        'Generate Leads': "Lead generation is the lifeblood of growth! 📈",
        'Educate My Audience': "Knowledge sharing creates loyal communities. Love it! 🤝",
        'default': "That's a solid goal!"
      }
    },
    {
      id: 'voice',
      question: "How do you want your brand to sound?",
      type: 'choice',
      options: ['Professional & Authoritative', 'Friendly & Casual', 'Witty & Humorous', 'Technical & Expert'],
      extractKey: 'brandVoice',
      personalizedReplies: {
        'Professional & Authoritative': "Professional content builds serious trust. 💼",
        'Friendly & Casual': "Friendly brands create the best connections! 😊",
        'Witty & Humorous': "Humor makes everything more memorable! 😄",
        'Technical & Expert': "Technical expertise is so valuable. Rock on! 🔧",
        'default': "Great voice choice!"
      }
    },
    {
      id: 'language',
      question: "Finally, what language will you be creating content in?",
      type: 'choice',
      options: ['English', 'Spanish', 'French', 'German', 'Dutch', 'Portuguese'],
      extractKey: 'language',
      personalizedReplies: {
        'English': "Perfect! Let's create amazing English content together. 🌍",
        'Spanish': "¡Excelente! Spanish content has huge potential. 🇪🇸",
        'French': "Magnifique! French content adds such elegance. 🇫🇷",
        'German': "Wunderbar! German content means quality. 🇩🇪",
        'Dutch': "Geweldig! Dutch content is on the rise. 🇳🇱",
        'Portuguese': "Ótimo! Portuguese opens up amazing markets. 🇧🇷",
        'default': "Great language choice!"
      }
    }
  ];