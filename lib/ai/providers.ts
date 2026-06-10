import {
  customProvider,
} from 'ai';
import { google } from '@ai-sdk/google';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': google('gemini-3.1-flash-lite') as any,
        'chat-model-reasoning': google('gemini-3.1-flash-lite') as any,
        'title-model': google('gemini-3.1-flash-lite') as any,
        'artifact-model': google('gemini-3.1-flash-lite') as any,
      },
      imageModels: {
        'small-model': google.image('imagen-3.0-generate-002') as any,
      },
    });
