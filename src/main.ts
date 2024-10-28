import * as core from '@actions/core'
import { wait } from './wait.js'
import { getLocks, setLock } from './semaphore.js'
import { GitHub } from './github.js'
import * as _ from 'lodash'

const https = require('https')

const octoAuth = require('@octokit/auth-action')
const Request = require('@octokit/request')

const component = core.getInput('component')
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const github = new GitHub()
    await github.performAuth()

    const labels = await github.getLabels()

    // Manual deployment, check locks
    const locks = (await getLocks(component)).data.data
    const activeLock = _.find(locks, {
      component: component,
      unlocked_by: null
    })
    core.debug(JSON.stringify(labels))
    if (_.includes(labels, 'auto deploy')) {
      if (activeLock) {
        // There is a lock, so we check if we cancel or wait
        if (activeLock.purpose !== 'manual deployment lock') {
          // Some other deployment is running, so we wait
          await wait(60000)
        } else {
          // manual deployment lock active. Abort!
          core.setFailed('Manual deployment lock active!')
        }
      }
    } else {
      // No lock, we need to lock deployment
      if (!activeLock) {
        const { error } = await setLock(component)
      }

      // Manual deployment, so deployment is not permitted
      core.setFailed('Manual deployment lock active!')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
