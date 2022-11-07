import {Chip8} from "./chip-8";
import {dec2bin, rand} from "./utils";

type Opcode = (cpu: Chip8, ...args: number[]) => void;

const DISPLAY_WIDTH = 64;
const DISPLAY_HEIGHT = 32;

export const opcodes: Record<string, Opcode> = {
    'ANNN': (cpu, nnn) => cpu.i = nnn,
    'CXNN': (cpu, x, nn) => cpu.v[x] = rand() & nn,
    '3XNN': (cpu, x, nn) => {
        if (cpu.v[x] === nn) {
            cpu.pc += 2
        }
    },
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
    '7XNN': (cpu, x, nn) => cpu.v[x] += nn,
    '1NNN': (cpu, nnn) => cpu.pc = nnn,
    '6XNN': (cpu, x, nn) => cpu.v[x] = nn,
    '8XY0': (cpu, x, y) => cpu.v[x] = cpu.v[y],
    '2NNN': (cpu, nnn) => {
        cpu.stack.push(cpu.pc);
        cpu.pc = nnn;
    }
}

