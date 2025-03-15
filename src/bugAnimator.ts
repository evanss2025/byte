import * as vscode from 'vscode';
import { bugDetector } from './bugDetector';

export class bugAnimator {
    private bugs: Bug[] = [];
    public running: boolean = false;

    constructor() {
    }

    public createBug(editor: vscode.TextEditor, position: vscode.Position) {
        console.log("createBug function is running");
        const bug = new Bug(editor, position, this);
        this.bugs.push(bug);
        bug.show();
        bug.startMoving();
        console.log(this.bugs);
    }

    public startBugs(editor: vscode.TextEditor, positions: vscode.Position[]) {
        this.running = true;
        for (const position of positions) {
            if (!this.bugs.some(bug => bug.position.isEqual(position))) {
                this.createBug(editor, position);
            }
        }
    }

    public endBugs() {
        this.running = false;
        for (const bug of this.bugs) {
            console.log("Stopping bug at position:", bug.position);
            bug.stop();
        }
        this.bugs = [];

        console.log("endBugs function is running");
        console.log(this.bugs);
    }

    public removeBug(position: vscode.Position) {
        const bugIndex = this.bugs.findIndex(bug => bug.position.isEqual(position));
        if (bugIndex !== -1) {
            this.bugs[bugIndex].stop();
            this.bugs.splice(bugIndex, 1);
            console.log(`Bug at position ${position.line}:${position.character} removed`);
        }
    }

    // In bugAnimator.ts
    public updateBugs(editor: vscode.TextEditor) {
        const Detector = new bugDetector(editor);
        const bugPositions = Detector.detectBugs();

        console.log("Detected bug positions:", bugPositions.map(p => `${p.line}:${p.character}`));
        
        // Remove bugs that are fixed
        for (let i = this.bugs.length - 1; i >= 0; i--) {
            const bug = this.bugs[i];
            const stillHasBug = bugPositions.some(pos => 
                pos.line === bug.originalPosition.line
            );
            
            if (!stillHasBug) {
                console.log(`Removing bug at original position ${bug.originalPosition.line}:${bug.originalPosition.character}`);
                bug.stop();
                this.bugs.splice(i, 1);
            }
        }

        // Add new bugs
        if (this.running) {
            for (const position of bugPositions) {
                const alreadyHasBug = this.bugs.some(bug => 
                    bug.originalPosition.line === position.line
                );
                
                if (!alreadyHasBug) {
                    console.log(`Adding new bug at position ${position.line}:${position.character}`);
                    this.createBug(editor, position);
                }
            }
        }
    }
}

class Bug {
    private bugs: string[] = ['🐜', '🐛', '🪲', '🦗', '🐞'];

    private editor: vscode.TextEditor;
    public position: vscode.Position;
    public originalPosition: vscode.Position;
    private animator: bugAnimator;
    private interval: NodeJS.Timeout | null = null;
    private decorationType: vscode.TextEditorDecorationType;

    constructor(editor: vscode.TextEditor, position: vscode.Position, animator: bugAnimator) {
        this.editor = editor;
        this.position = position;
        this.originalPosition = position.with();
        this.animator = animator;

        this.decorationType = vscode.window.createTextEditorDecorationType({
            before: {
                contentText: this.randomBug(),
                margin: '0 5px 0 0'
            }
        });
    }

    show() {
        this.editor.setDecorations(this.decorationType, [new vscode.Range(this.position, this.position)]);
    }

    move() {
        if (!this.animator.running) {
            console.log("Bug movement stopped because animator is not running");
            return;
        }
    
        console.log("bug is moving");
        
        let lineOffset = Math.floor(Math.random() * 15) - 7;
        let charOffset = Math.floor(Math.random() * 15) - 7;
        
        let newLine = Math.max(0, Math.min(this.editor.document.lineCount - 1, this.position.line + lineOffset));
        
        let lineLength = this.editor.document.lineAt(newLine).text.length;
        let newChar = Math.max(0, Math.min(lineLength, this.position.character + charOffset));
        
        this.position = new vscode.Position(newLine, newChar);
        this.show();
    
        if (Math.random() < 0.5) { 
            this.deleteCode();
        }
    }

    startMoving() {
        this.interval = setInterval(() => this.move(), 300);
    }

    stop() {
        if (this.interval) {
            console.log("Clearing interval for bug at position:", this.position);
            clearInterval(this.interval);
            this.interval = null; 
        }
        this.editor.setDecorations(this.decorationType, []);
    }

    public randomBug(): string {
        let randomIndex = Math.floor(Math.random() * this.bugs.length);
        console.log(this.bugs[randomIndex]);
        return this.bugs[randomIndex];
    }

    public deleteCode() {
        let lineText = this.editor.document.lineAt(this.position.line).text;
        if (lineText.length === 0) return;

        let deleteIndex = Math.floor(Math.random() * lineText.length);
        let range = new vscode.Range(
            new vscode.Position(this.position.line, deleteIndex),
            new vscode.Position(this.position.line, deleteIndex + 1)
        );
        this.editor.edit(editBuilder => {
            editBuilder.delete(range);
        });
    }
}