import { getLock } from './main'
import * as core from '@actions/core'

export async function checkOrWait(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await check(resolve, reject)
  })
}

async function check(resolve: any, reject: any) {
  const lock = await getLock()

  if (!lock) {
    resolve('Done!')
  } else {
    if (lock.purpose === 'manual deployment lock') {
      // Some other deployment is running, so we wait
      core.setOutput('deployment_lock', lock.id)
      reject('Locked')
    } else {
      setTimeout(() => {
        check(resolve, reject)
      }, 20000)
    }
  }
}
