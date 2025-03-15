import * as vscode from 'vscode';

export class bugAnimator {
    private bugs: Bug[] = [];
    public running: boolean = false;

    constructor() {
        // this.context = context;
    }

    public createBug(editor: vscode.TextEditor, position: vscode.Position) {
        if (!this.running) return; // Do not create new bugs if not running

        console.log("createBug function is running");
        const bug = new Bug(editor, position, this);
        this.bugs.push(bug);
        bug.show();
        bug.startMoving();
        console.log(this.bugs);
    }

    public startBugs(editor: vscode.TextEditor, position: vscode.Position) {
        this.running = true;
        this.createBug(editor, position);
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
}

class Bug {
    private bugs: string[] = ['🐜', '🐛', '🪲', '🦗', '🐞'];

    private editor: vscode.TextEditor;
    public position: vscode.Position;
    private animator: bugAnimator;
    private interval: NodeJS.Timeout | null = null;
    private decorationType: vscode.TextEditorDecorationType;

    constructor(editor: vscode.TextEditor, position: vscode.Position, animator: bugAnimator) {
        this.editor = editor;
        this.position = position;
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
        let verticalDirections = [-1, 1];
        let horizontalDirections = [-1, 1];

        let lineOffset = verticalDirections[Math.floor(Math.random() * verticalDirections.length)];
        let charOffset = horizontalDirections[Math.floor(Math.random() * horizontalDirections.length)];

        let newLine = Math.max(0, Math.min(this.editor.document.lineCount - 1, this.position.line + lineOffset));
        let newChar = Math.max(0, Math.min(this.editor.document.lineAt(newLine).text.length, this.position.character + charOffset));

        this.position = new vscode.Position(newLine, newChar);
        this.show();

        if (Math.random() < 0.2) {
            this.deleteCode();
        }
    }

    startMoving() {
        this.interval = setInterval(() => this.move(), 1500);
    }

    stop() {
        if (this.interval) {
            console.log("Clearing interval for bug at position:", this.position);
            clearInterval(this.interval);
            this.interval = null; // Ensure the interval is cleared
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