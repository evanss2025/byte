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
		const bugPositions = Detector.detectBugs();
	
		if (bugPositions.length > 0) {
			vscode.window.showInformationMessage('Bugs detected');
			if (!Animator.running) {
				// Only start bugs if not already running
				Animator.startBugs(editor, bugPositions);
			} else {
				// Otherwise just update the existing bugs
				Animator.updateBugs(editor);
			}
		} else {
			vscode.window.showInformationMessage('No bugs detected');
			if (Animator.running) {
				Animator.endBugs();
			}
		}
	}

    let startBugs = vscode.commands.registerCommand('Byte.Start', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.window.showInformationMessage('Releasing the Bugs');
            detect(); // Call detect once to create bugs if needed
            detectInterval = setInterval(() => detect(), 5000); // Call detect every 5 seconds
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

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        Animator.updateBugs(editor);
    });

    context.subscriptions.push(startBugs, endBugs);
}

export function deactivate() {
    if (detectInterval) {
        clearInterval(detectInterval);
    }
}