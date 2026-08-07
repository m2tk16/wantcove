import { Amplify } from 'aws-amplify'

const outputModules = import.meta.glob('/amplify_outputs.json', {
  eager: true,
  import: 'default',
}) as Record<string, object>

const amplifyOutputs = Object.values(outputModules)[0]

if (amplifyOutputs) {
  Amplify.configure(amplifyOutputs)
}

export const hasAmplifyConfiguration = Boolean(amplifyOutputs)
