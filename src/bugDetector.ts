import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export class bugDetector {
    public positions: vscode.Position[] = [];

    private editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    public detectBugs(): vscode.Position[] {
        // Clear previous positions before detecting new ones
        this.positions = [];
        
        const document = this.editor.document;
        const text = document.getText();
    
        // Simple bug detection logic: check for missing semicolons at the end of lines
        const lines = text.split('\n');
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.startsWith('//')) {
                this.positions.push(new vscode.Position(lineNumber, line.length));
            }
        }
    
        return this.positions;
    }
}