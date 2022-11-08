import {matrix} from "./utils";
import {OpcodeMatcher} from "./opcode-matcher";
import {opcodes} from "./opcodes";
import {original} from "./font";


export class Chip8 {
    PROGRAM_MEMORY = 512;
    FONT_MEMORY = 0x50;

    i = 0;
    pc = this.PROGRAM_MEMORY;
    // TODO: can we replace this with buffers?
    v = Array(16).fill(0);
    display = matrix(64, 32);
    stack: number[] = [];
    memory = Array(4096).fill(0);

    opcodeMatcher = new OpcodeMatcher();

    get vf() {
        return this.v[15];
    }

    set vf(value) {
        this.v[15] = value;
    }

    constructor(code?: any[]) {
        if (code) {
            this.loadFromHexDump(code)
        }

        this.loadFont(original);
    }

    reset() {
        this.i = 0;
        this.pc = this.PROGRAM_MEMORY;
        this.v = Array(16).fill(0);
        this.clearDisplay();
        this.stack = [];
        this.memory = Array(4096).fill(0);
    }

    next() {
        this.pc += 2;
    }

    clearDisplay() {
        this.display = matrix(64, 32);
    }

    step() {
        const raw = this.memory[this.pc++].toString(16).padStart(2, '0') + this.memory[this.pc++].toString(16).padStart(2, '0');
        const instruction = this.opcodeMatcher.disassembleFromRaw(raw);

        if (!instruction) {
            throw new Error(`Failed to disassemble instruction 0x${raw}`);
        }

        console.log(this, instruction, instruction.opcode, instruction.instruction);

        const implementation = opcodes[instruction.opcode];

        // @ts-ignore
        implementation(this, ...instruction.parameters);
    }

    loadFont(font: number[]) {
        for (let i = 0; i < font.length; i++) {
            this.memory[this.FONT_MEMORY + i] = font[i];
        }
    }

    // TODO @deprecated
    loadFromHexDump(code: any[]) {
        this.reset();
        code.forEach((instruction, i) => {
            this.memory[this.PROGRAM_MEMORY + i * 2] = parseInt(instruction.slice(0, 2), 16);
            this.memory[this.PROGRAM_MEMORY + i * 2 + 1] = parseInt(instruction.slice(2, 4), 16);
        });
    }

    loadFromArrayBuffer(code: Uint8Array) {
        this.reset();
        code.forEach((value, i) => {
            this.memory[this.PROGRAM_MEMORY + i] = value;
        })
    }

    snapshot(): Array<Array<boolean>> {
        return JSON.parse(JSON.stringify(this.display));
    }
}
