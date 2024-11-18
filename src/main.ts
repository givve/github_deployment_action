import * as core from '@actions/core'
import { checkOrWait } from './wait.js'
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
    if (core.getInput('pull_request') != '') {
      const github = new GitHub()
      await github.performAuth()
      const labels = await github.getLabels()
      if (
        !_.includes(labels, 'auto deploy') &&
        _.includes(labels, 'manual deploy')
      ) {
        let lock = await getLock()
        // No lock, we need to lock deployment
        if (!lock) {
          const { data } = await setLock(component)
          lock = data.data
        }
        // Manual deployment, so deployment is not permitted
        core.setOutput('deployment_lock', lock.id + 'TEST')
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export async function getLock() {
  // Manual deployment, check locks
  const locks = (await getLocks(component)).data.data

  return _.find(locks, {
    component: component,
    unlocked_by: null
  })
}
