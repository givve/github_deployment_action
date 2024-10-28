const axios = require('axios')
import * as core from '@actions/core'

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

export async function setLock(component: string): Promise<any> {
  console.log('SET LOCK')
  return axios.post(
    semaphoreAPI +
      `/api/products/5f7427d977b4b64aeabad92d/components/${component}/locks`,
    {
      lock: {
        created_by: 'github_action',
        purpose: 'manual deployment lock',
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
