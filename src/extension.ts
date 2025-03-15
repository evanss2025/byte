import * as vscode from 'vscode';
import { bugAnimator } from './bugAnimator';
import { bugDetector } from './bugDetector';

let detectInterval: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
    let Animator: bugAnimator;

    Animator = new bugAnimator();

    console.log('Congratulations, your extension "byte" is now active!');

    function detect() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }
        const Detector = new bugDetector(editor);
        const position = editor.selection.active;

        if (Detector.detectBug()) {
            vscode.window.showInformationMessage('Bug detected');
            Animator.startBugs(editor, position);
        } else {
            vscode.window.showInformationMessage('No bug detected');
        }
    }

    let startBugs = vscode.commands.registerCommand('Byte.Start', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.window.showInformationMessage('Releasing the Bugs');
            detect(); // Call detect once to create a bug if needed
            detectInterval = setInterval(() => detect(), 5000);
        } else {
            vscode.window.showInformationMessage('No active editor found');
        }
    });

    let endBugs = vscode.commands.registerCommand('Byte.End', () => {
        vscode.window.showInformationMessage('Killing the bugs');
        Animator.endBugs();
        if (detectInterval) {
            clearInterval(detectInterval);
            detectInterval = null;
        }
    });

    context.subscriptions.push(startBugs, endBugs);
}

// This method is called when your extension is deactivated
export function deactivate() {
    if (detectInterval) {
        clearInterval(detectInterval);
    }
}