import * as core from '@actions/core'
import { getLock } from './semaphore'

export async function checkOrWait(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await check(resolve, reject)
  })
}

export async function check(resolve: any, reject: any) {
  const component = core.getInput('component')

  const lock = await getLock(component + '_deploy')
  const capistranoLock = await getLock(component)

  if (!lock) {
    resolve('Done!')
  } else {
    if (lock) {
      // Some other deployment is running, so we wait
      core.setOutput('deployment_lock', lock.id)
      core.setOutput('github_pr', lock.purpose)
      core.setOutput('lock_msg', 'Automatic deployment locked by manual lock.')
      reject('Locked')
    } else if (capistranoLock) {
      setTimeout(() => {
        check(resolve, reject)
      }, 20000)
    } else {
      reject('Locked')
    }
  }
}
