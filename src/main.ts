import * as core from '@actions/core'
import { check, checkOrWait } from './wait.js'
import { getLock, getLocks, setLock } from './semaphore.js'
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
      const url = await github.getPRUrl()

      if (
        !_.includes(labels, 'auto deploy') &&
        _.includes(labels, 'manual deploy')
      ) {
        let lock = await getLock(component + '_deploy')
        // No lock, we need to lock deployment
        if (!lock) {
          try {
            const { data } = await setLock(component + '_deploy', url)

            lock = data.data
            core.setOutput(
              'lock_msg',
              'Manual deployment enabled! Automatic deployment disabled!'
            )
            core.setOutput('github_pr', url)
          } catch (error) {
            console.log(error)
          }
        } else {
          core.setOutput(
            'lock_msg',
            'Deployment already locked! Please check PR!'
          )
          core.setOutput('github_pr', lock.purpose)
        }

        // Manual deployment, so deployment is not permitted
        core.setOutput('deployment_lock', lock.id)
        core.setOutput('github_pr', url)
      }
    } else {
      await checkOrWait()
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
