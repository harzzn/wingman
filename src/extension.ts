import * as WebSocket from 'ws'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import { TextEncoder } from 'util'
import { Uri } from 'vscode'
import { getUri } from './get-uri'

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
let queue: number[] = []

const remove = function (id: number) {
  queue = queue.filter(function (value) {
    return value !== id
  })
}

function startWebsocket () {
  ws = new WebSocket('ws://localhost:8080', {
    /* headers: {
      token: ''
    } */
  })

  vscode.window.showInformationMessage('Websocket connection established')

  ws.on('message', async function incoming (message) {
    vscode.window.showInformationMessage('Websocket message received')

    const encoder = new TextEncoder()
    const { functionName, output } = JSON.parse(message.toString())
    const content = encoder.encode(output)

    const uri = await getUri(functionName)
    await vscode.workspace.fs.writeFile(uri, content)

    const document = await vscode.workspace.openTextDocument(uri)
    vscode.window.showTextDocument(document)

    remove(parseInt(message.toString()))

    if (queue.length === 0 && typeof ws !== 'undefined') {
      ws.close()
    }
  })

  ws.on('close', function close () {
    ws = undefined
    vscode.window.showInformationMessage('Websocket connection disconnected')
  })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate (context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "wingman" is now active!')

  //const storageManager = new LocalStorageService(context.globalState)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'wingman.helloWorld',
    async () => {
      if (typeof ws === 'undefined') {
        startWebsocket()
      }

      const id = Date.now()
      queue.push(id)

      const input = await vscode.window.showInputBox({
        prompt: 'Create react component with Material UI that has',
        title: 'Create react component with Material UI that has',
        value: 'a dialog with form for first name, last name and submit button'
      })

      if (typeof ws !== 'undefined') {
        vscode.window.showInformationMessage('Loading...')
        ws.send(input)
      }
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate () {}
