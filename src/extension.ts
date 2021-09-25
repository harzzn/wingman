import * as WebSocket from 'ws'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import { TextEncoder } from 'util'
import { getUri } from './get-uri'
import { nanoid } from 'nanoid'

// import { Memento } from 'vscode'

/*export class LocalStorageService {
  constructor (private storage: Memento) {}

  public getValue<T> (key: string): T {
    return this.storage.get<T>(key, null)
  }

  public setValue<T> (key: string, value: T) {
    this.storage.update(key, value)
  }
} */

let ws: WebSocket | undefined = undefined
let queue: { key: string; timeout: NodeJS.Timeout }[] = []

const remove = function (key: string) {
  const object = queue.find(function (value) {
    return value.key === key
  })

  if (typeof object?.timeout !== 'undefined') {
    clearInterval(object.timeout)
  }

  queue = queue.filter(function (value) {
    return value.key !== key
  })
}

const showLoading = function (startTime: Date) {
  let loadingMessage = 'Loading component...'

  const endTime = new Date()
  const difference = (endTime.getTime() - startTime.getTime()) / 1000
  const seconds = Math.round(difference)

  if (seconds > 0) {
    loadingMessage += ` ${seconds}s...`
  }

  vscode.window.showInformationMessage(loadingMessage)
}

function startWebsocket () {
  ws = new WebSocket('ws://localhost:8080', {
    /* headers: {
      token: ''
    } */
  })

  ws.on('connection', function connection () {
    console.log('Websocket connection established')
  })

  ws.on('message', async function incoming (message) {
    const { key, functionName, output } = JSON.parse(message.toString())
    vscode.window.showInformationMessage(
      `Creating the file for ${functionName} component...`
    )

    const encoder = new TextEncoder()
    const content = encoder.encode(output)

    const uri = await getUri(functionName)
    await vscode.workspace.fs.writeFile(uri, content)

    const document = await vscode.workspace.openTextDocument(uri)
    vscode.window.showTextDocument(document)

    vscode.window.showInformationMessage(
      `File created for ${functionName} component!`
    )

    remove(key)

    if (queue.length === 0 && typeof ws !== 'undefined') {
      ws.close()
    }
  })

  ws.on('close', function close () {
    ws = undefined
    console.log('Websocket connection disconnected')
  })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate (context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Wingman is now active!')

  //const storageManager = new LocalStorageService(context.globalState)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'wingman.generators.javascript.standard-prettier.react.material-ui.component',
    async () => {
      if (typeof ws === 'undefined') {
        startWebsocket()
      }

      const input = await vscode.window.showInputBox({
        prompt: 'Create react component with Material UI that has...',
        title: 'Create react component with Material UI that has...',
        value: 'a dialog with form for first name, last name and submit button'
      })

      if (typeof ws !== 'undefined') {
        const key = nanoid()
        const startTime = new Date()
        const timeout = setInterval(showLoading, 3000, startTime)
        showLoading(startTime)
        queue.push({ key, timeout })
        ws.send(JSON.stringify({ key, input }))
      }
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate () {}
