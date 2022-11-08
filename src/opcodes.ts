import {Chip8} from "./chip-8";
import {dec2bin, rand} from "./utils";

type Opcode = (cpu: Chip8, ...args: number[]) => void;

const DISPLAY_WIDTH = 64;
const DISPLAY_HEIGHT = 32;

export const opcodes: Record<string, Opcode> = {
    // Set I equal to NNN.
    'ANNN': (cpu, nnn) => cpu.i = nnn,

    // Set VX equal to a random number ranging from 0 to 255 which is logically anded with NN.
    'CXNN': (cpu, x, nn) => cpu.v[x] = rand() & nn,

    // Skip the next instruction if register VX is equal to NN.
    '3XNN': (cpu, x, nn) => {
        if (cpu.v[x] === nn) {
            cpu.next();
        }
    },

    // TODO needs work
    // Display N-byte sprite starting at memory location I at (VX, VY). Each set bit of xored with what's already drawn. VF is set to 1 if a collision occurs. 0 otherwise.
    'DXYN': (cpu, x, y, n) => {
        const vx = cpu.v[x];
        const vy = cpu.v[y];

        for (let b = 0; b < n; b++) {
            const byte = parseInt(cpu.memory[cpu.i + b], 16);
            const bits = dec2bin(byte);
            for (let a = 0; a < 8; a++) {
                const xx = vx + a;
                const yy = vy + b;
                const set = bits[a] === '1';
                if (set) {
                    cpu.display[xx % DISPLAY_WIDTH][yy % DISPLAY_HEIGHT] = true;
                }
            }
        }
    },
    // Add immediate value NN to register VX. Does not effect VF.
    '7XNN': (cpu, x, nn) => cpu.v[x] += nn,
    '1NNN': (cpu, nnn) => cpu.pc = nnn,
    '6XNN': (cpu, x, nn) => cpu.v[x] = nn,
    '8XY0': (cpu, x, y) => cpu.v[x] = cpu.v[y],
    '2NNN': (cpu, nnn) => {
        cpu.stack.push(cpu.pc);
        cpu.pc = nnn;
    },
    'BXYN': (cpu, x, y, n) => {
        debugger;
    },
    '00EE': (cpu) => {
        cpu.pc = cpu.stack.pop() as number;
    },
    '0NNN': (cpu, nnn) => {
        debugger;
    },
    'FX1E': (cpu, x) => {
        cpu.i += cpu.v[x];
        cpu.vf = cpu.i > 0x0FFF ? 1 : 0;
    },
    '4XNN': (cpu, x, nn) => {
        if (cpu.v[x] !== nn) {
            cpu.next();
        }
    },
    '5XY0': (cpu, x, y) => {
        if (cpu.v[x] === cpu.v[y]) {
            cpu.next();
        }
    },
    '8XY2': (cpu, x, y) => {
        cpu.v[x] = cpu.v[x] & cpu.v[y];
    },
    '8XY4': (cpu, x, y) => {
        const sum = cpu.v[x] + cpu.v[y];
        cpu.v[x] = sum;
        cpu.vf = sum > 0xFFFF ? 1 : 0;
    },
    '8XY6': (cpu, x) => { // Y is ignored
        cpu.vf = cpu.v[x] % 1;
        cpu.v[x] = cpu.v[x] >> 1;
    },
    '8XY7': (cpu, x, y) => {
        cpu.v[x] = cpu.v[y] - cpu.v[x];
        cpu.vf = cpu.v[y] > cpu.v[x] ? 1 : 0;
    },
    '8XYE': (cpu, x, y) => {
        cpu.vf = (cpu.v[x] & 0x80) > 0 ? 1 : 0;
        cpu.v[x] = cpu.v[x] << 1;
    },
    'FXFB': (cpu, x) => {
        cpu.v[x] = 1; // get input
    },
    'FX65': (cpu, x) => {
        for (let index = 0; index < x; index++) {
            cpu.v[index] = cpu.memory[cpu.i + index]
        }
    },
    'FX55': (cpu, x) => {
        for (let i = 0; i < x; i++) {
            cpu.memory[cpu.i + i] = cpu.v[i]
        }
    },
    '00BN': () => {
        debugger;
    },
    '00CN': () => {
        debugger;
    },
    '00E0': (cpu) => {
        cpu.clearDisplay();
    },
    '00FB': () => {
        debugger;
    },
    '00FC': () => {
        debugger;
    },
    '00FD': () => {
        debugger;
    },
    '00FE': () => {
        debugger;
    },
    '00FF': () => {
        debugger;
    },
    '02A0': () => {
        debugger;
    },
    '5XY1': () => {
        debugger;
    },
    '5XY2': () => {
        debugger;
    },
    '5XY3': () => {
        debugger;
    },
    '8XY1': () => {
        debugger;
    },
    '8XY3': (cpu, x, y) => {
        cpu.v[x] = cpu.v[x] ^ cpu.v[y];
    },
    '8XY5': (cpu, x, y) => {
        const sub = cpu.v[x] - cpu.v[y];
        cpu.vf = cpu.v[x] > cpu.v[y] ? 1 : 0;
        cpu.v[x] = sub < 0 ? sub + 0xFFFF : sub;
    },
    '9XY0': (cpu, x, y) => {
        if (cpu.v[x] !== cpu.v[y]) {
            cpu.next();
        }
    },
    '9XY1': () => {
        debugger;
    },
    '9XY2': () => {
        debugger;
    },
    '9XY3': () => {
        debugger;
    },
    'BNNN': () => {
        debugger;
    },
    'B0NN': () => {
        debugger;
    },
    'B1X0': () => {
        debugger;
    },
    'B1X1': () => {
        debugger;
    },
    'BXY0': () => {
        debugger;
    },
    'DXY0': () => {
        debugger;
    },
    'EX9E': () => {
        debugger;
    },
    'EXA1': () => {
        debugger;
    },
    'EXF2': () => {
        debugger;
    },
    'EXF5': () => {
        debugger;
    },
    'FX07': () => {
        debugger;
    },
    'FX0A': () => {
        debugger;
    },
    'FX15': () => {
        debugger;
    },
    'FX18': () => {
        debugger;
    },
    'FX29': () => {
        debugger;
    },
    'FX30': () => {
        debugger;
    },
    'FX33': () => {
        debugger;
    },
    'FX75': () => {
        debugger;
    },
    'FX85': () => {
        debugger;
    },
    'FX94': () => {
        debugger;
    },
    'FXF8': () => {
        debugger;
    },
}

