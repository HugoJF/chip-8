import {matrix} from "./utils";
import {OpcodeMatcher} from "./opcode-matcher";
import {opcodes} from "./opcodes";

export const PROGRAM_MEMORY = 512;

export class Chip8 {
    i = 0;
    pc = PROGRAM_MEMORY;
    v = Array(16).fill(0);
    display = matrix(64, 32);
    stack = Array(16).fill(0);
    memory = Array(4096).fill(0);

    opcodeMatcher = new OpcodeMatcher();

    constructor(code?: any[]) {
        if (code) {
            this.load(code)
        }
    }

    step() {
        const raw = this.memory[this.pc++] + this.memory[this.pc++];
        const instruction = this.opcodeMatcher.disassembleFromRaw(raw);

        if (!instruction) {
            throw new Error(`Failed to disassemble instruction 0x${raw}`);
        }

        const implementation = opcodes[instruction.opcode];

        // @ts-ignore
        implementation(this, ...instruction.parameters);
    }

    load(code: any[]) {
        code.forEach((instruction, index) => {
            this.memory[PROGRAM_MEMORY + index * 2 + 0] = instruction.slice(0, 2);
            this.memory[PROGRAM_MEMORY + index * 2 + 1] = instruction.slice(2, 4);
        })
    }

    snapshot(): Array<Array<boolean>> {
        return JSON.parse(JSON.stringify(this.display));
    }
}
