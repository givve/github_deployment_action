const axios = require('axios')

const octoAuth = require('@octokit/auth-action')
const Request = require('@octokit/request')

import * as core from '@actions/core'

export class GitHub {
  private requestWithAuth: any

  constructor() {}

  async performAuth() {
    const auth = octoAuth.createActionAuth()
    const authentication = await auth()

    this.requestWithAuth = Request.request.defaults({
      request: {
        hook: auth.hook
      },
      mediaType: {
        previews: ['machine-man']
      }
    })
  }

  async getPRUrl(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const { data: issue, error: error } = await this.requestWithAuth(
        'GET /repos/{owner}/{repo}/issues/{pull_number}',
        {
          owner: 'givve',
          repo: 'givve',
          pull_number: core.getInput('pull_request')
        }
      )

      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(issue.html_url)
      }
    })
  }

  async getLabels(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      const { data: issue, error: error } = await this.requestWithAuth(
        'GET /repos/{owner}/{repo}/issues/{pull_number}',
        {
          owner: 'givve',
          repo: 'givve',
          pull_number: core.getInput('pull_request')
        }
      )
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(issue.labels.map((label: any) => label.name))
      }
    })
  }
}
