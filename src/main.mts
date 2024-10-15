import * as core from '@actions/core'
import { wait } from './wait.mjs'
import { createActionAuth } from '@octokit/auth-action'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const commit: string = core.getInput('commit')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`${commit} needs to be deployed ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(10000)
    core.debug(new Date().toTimeString())

    const auth = createActionAuth()
    const authentication = await auth()

    console.log(authentication)

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
