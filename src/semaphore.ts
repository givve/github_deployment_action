const axios = require('axios')
import * as core from '@actions/core'
import _ from 'lodash'

// TEMP: Will be implemented via action inputs
const semaphoreAPI = core.getInput('semaphoreAPI')
const semaphoreAPIKey = core.getInput('semaphoreAPIKey')
export async function getLocks(component: string): Promise<any> {
  return axios.get(
    semaphoreAPI +
      `/api/products/5f7427d977b4b64aeabad92d/components/${component}/locks`,
    {
      headers: {
        Authorization: semaphoreAPIKey
      }
    }
  )
}

export async function setLock(component: string, url: string): Promise<any> {
  return axios.post(
    semaphoreAPI +
      `/api/products/5f7427d977b4b64aeabad92d/components/${component}/locks`,
    {
      lock: {
        created_by: 'github_action',
        purpose: url,
        expires_at: null
      }
    },
    {
      headers: {
        Authorization: semaphoreAPIKey
      }
    }
  )
}

export async function getLock(component: string) {
  // Manual deployment, check locks
  const locks = (await getLocks(component)).data.data

  return _.find(locks, {
    component: component,
    unlocked_by: null
  })
}
