import * as vscode from 'vscode'

import { Uri } from 'vscode'

export const getUri = async function (functionName: string) {
  let currentUri = vscode.window.activeTextEditor?.document.uri
  let pathAdjust = '../'

  if (typeof currentUri === 'undefined') {
    currentUri = vscode.workspace.workspaceFolders?.find(function (_, index) {
      return index === 0
    })?.uri
    pathAdjust = ''
  }

  if (typeof currentUri === 'undefined') {
    currentUri = Uri.from({
      scheme: 'file',
      path: await vscode.window.showInputBox({
        prompt: 'Where to save',
        title: 'Path to save',
        value: '/'
      })
    })
    pathAdjust = ''
  }

  const newUri = Uri.joinPath(currentUri, pathAdjust, `${functionName}.js`)
  console.log('newUri', newUri)

  return newUri
}
