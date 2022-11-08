import {matrix} from "./utils";
import {OpcodeMatcher} from "./opcode-matcher";
import {opcodes} from "./opcodes";

export const PROGRAM_MEMORY = 512;

export class Chip8 {
    i = 0;
    pc = PROGRAM_MEMORY;
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
    }

    reset() {
        this.i = 0;
        this.pc = PROGRAM_MEMORY;
        this.v = Array(16).fill(0);
        this.clearDisplay();
        this.stack = Array(16).fill(0);
        this.memory = Array(4096).fill(0);
    }

    next() {
        this.pc += 2;
    }

    clearDisplay() {
        this.display = matrix(64, 32);
    }

    step() {
        const raw = this.memory[this.pc++] + this.memory[this.pc++];
        const instruction = this.opcodeMatcher.disassembleFromRaw(raw);

        if (!instruction) {
            throw new Error(`Failed to disassemble instruction 0x${raw}`);
        }

        console.log(instruction.opcode, instruction.instruction);

        const implementation = opcodes[instruction.opcode];

        // @ts-ignore
        implementation(this, ...instruction.parameters);
    }

    loadFromHexDump(code: any[]) {
        this.reset();
        code.forEach((instruction, i) => {
            this.memory[PROGRAM_MEMORY + i * 2] = instruction.slice(0, 2);
            this.memory[PROGRAM_MEMORY + i * 2 + 1] = instruction.slice(2, 4);
        });
    }

    loadFromArrayBuffer(code: Uint8Array) {
        this.reset();
        code.forEach((value, i) => {
            this.memory[PROGRAM_MEMORY + i] = value.toString(16).padStart(2, '0');
        })
    }

    snapshot(): Array<Array<boolean>> {
        return JSON.parse(JSON.stringify(this.display));
    }
}
