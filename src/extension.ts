import * as WebSocket from 'ws'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// import { Memento } from 'vscode'

/* import { TextEncoder } from 'util'
import { Uri } from 'vscode' */

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
  ws = new WebSocket('ws://localhost:8080')

  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
    vscode.window.showInformationMessage(message.toString())
    remove(parseInt(message.toString()))

    if (queue.length === 0 && typeof ws !== 'undefined') {
      ws.close()
    }
  })

  ws.on('close', function close () {
    ws = undefined
    vscode.window.showInformationMessage('disconnected')
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
      /*
      const uri =
        vscode.window.activeTextEditor?.document.uri ||
        vscode.workspace.workspaceFolders?.find(function (
          workspaceFolder,
          index
        ) {
          return index === 0
        })?.uri ||
        Uri.from({
          scheme: 'file',
          path: await vscode.window.showInputBox({
            prompt: 'Where to save',
            title: 'Path to save',
            value: '/'
          })
        })

      vscode.window.showInformationMessage('Start fetch')

      vscode.window.showInformationMessage('Fetch completed')

      const encoder = new TextEncoder()
      const content = encoder.encode(data)

      const newUri = Uri.joinPath(uri, '../new-file.js')
      vscode.workspace.fs.writeFile(newUri, content)

      console.log('newUri', newUri)

      const document = await vscode.workspace.openTextDocument(newUri)
      vscode.window.showTextDocument(document)
      */

      if (typeof ws === 'undefined') {
        startWebsocket()
      }

      const id = Date.now()
      queue.push(id)

      if (typeof ws !== 'undefined') {
        ws.on('open', function open () {
          vscode.window.showInformationMessage('connected')
          if (typeof ws !== 'undefined') {
            ws.send(id)
          }
        })
      }
    }
  )

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate () {}
