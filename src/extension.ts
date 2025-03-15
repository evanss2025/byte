import * as vscode from 'vscode';
import { bugAnimator } from './bugAnimator';
import { bugDetector } from './bugDetector';

export function activate(context: vscode.ExtensionContext) {
    let Animator: bugAnimator;
    let Detector: bugDetector;

    Animator = new bugAnimator();
    Detector = new bugDetector();

    console.log('Congratulations, your extension "byte" is now active!');

    let startBugs = vscode.commands.registerCommand('Byte.Start', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = editor.selection.active;
            vscode.window.showInformationMessage('Releasing the Bugs');
            Animator.startBugs(editor, position);
        } else {
            vscode.window.showInformationMessage('No active editor found');
        }
    });

    let endBugs = vscode.commands.registerCommand('Byte.End', () => {
        vscode.window.showInformationMessage('Killing the bugs');
        Animator.endBugs();
    });

    context.subscriptions.push(startBugs, endBugs);
}

// This method is called when your extension is deactivated
export function deactivate() {}