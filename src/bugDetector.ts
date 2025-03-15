import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export class bugDetector {
    private editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    public detectBug(): boolean {
        const document = this.editor.document;
        const text = document.getText();

        // Simple bug detection logic: check for missing semicolons at the end of lines
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.startsWith('//')) {
                return true;
            }
        }

        return false;
    }
}