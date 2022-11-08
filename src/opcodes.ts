import {Chip8} from "./chip-8";
import {clamp, dec2bin, rand} from "./utils";

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
        const vx = cpu.v[x] % DISPLAY_WIDTH;
        const vy = cpu.v[y] % DISPLAY_HEIGHT;
        cpu.vf = false;

        for (let b = 0; b < n; b++) {
            const byte = cpu.memory[cpu.i + b];
            const bits = dec2bin(byte);
            for (let a = 0; a < 8; a++) {
                const xx = clamp(vx + a, 0, DISPLAY_WIDTH - 1);
                const yy = clamp(vy + b, 0, DISPLAY_HEIGHT - 1);
                const oldValue = cpu.display[xx][yy];
                const newValue = +(bits[a] === '1');
                if (oldValue && newValue) {
                    cpu.vf = +true;
                }
                cpu.display[xx][yy] = oldValue ^ newValue;
            }
        }
    },
    // Add immediate value NN to register VX. Does not effect VF.
    '7XNN': (cpu, x, nn) => cpu.v[x] += nn,

    // Set PC to NNN.
    '1NNN': (cpu, nnn) => cpu.pc = nnn,

    // Load immediate value NN into register VX.
    '6XNN': (cpu, x, nn) => cpu.v[x] = nn,

    // Copy the value in register VY into VX
    '8XY0': (cpu, x, y) => cpu.v[x] = cpu.v[y],

    // Call subroutine a NNN. Increment the SP and put the current PC value on the top of the stack.
    // Then set the PC to NNN. Generally there is a limit of 16 successive calls.
    '2NNN': (cpu, nnn) => {
        cpu.stack.push(cpu.pc);
        cpu.pc = nnn;
    },
    'BXYN': (cpu, x, y, n) => {
        debugger;
    },
    // Return from subroutine. Set the PC to the address at the top of the stack and subtract 1 from the SP.
    '00EE': (cpu) => {
        cpu.pc = cpu.stack.pop() as number;
    },
    '0NNN': (cpu, nnn) => {
        debugger;
    },
    // Add VX to I. VF is set to 1 if I > 0x0FFF. Otherwise set to 0.
    'FX1E': (cpu, x) => {
        cpu.i += cpu.v[x];
        cpu.vf = cpu.i > 0x0FFF ? 1 : 0;
    },
    // Skip the next instruction if register VX is not equal to NN.
    '4XNN': (cpu, x, nn) => {
        if (cpu.v[x] !== nn) {
            cpu.next();
        }
    },
    // Skip the next instruction if register VX equals VY.
    '5XY0': (cpu, x, y) => {
        if (cpu.v[x] === cpu.v[y]) {
            cpu.next();
        }
    },
    // Set VX equal to the bitwise and of the values in VX and VY.
    '8XY2': (cpu, x, y) => {
        cpu.v[x] = cpu.v[x] & cpu.v[y];
    },
    // Set VX equal to VX plus VY. In the case of an overflow VF is set to 1. Otherwise 0.
    '8XY4': (cpu, x, y) => {
        const sum = cpu.v[x] + cpu.v[y];
        cpu.v[x] = sum;
        cpu.vf = sum > 0xFFFF ? 1 : 0;
    },
    // Set VX equal to VX bitshifted right 1. VF is set to the least significant bit of VX prior to the shift.
    '8XY6': (cpu, x) => { // Y is ignored
        cpu.vf = cpu.v[x] % 1;
        cpu.v[x] = cpu.v[x] >> 1;
    },
    // Set VX equal to VY minus VX. VF is set to 1 if VY > VX. Otherwise 0.
    '8XY7': (cpu, x, y) => {
        const sub = cpu.v[y] - cpu.v[x]
        cpu.v[x] = sub < 0 ? sub + 0xFFFF : sub;
        cpu.vf = cpu.v[y] > cpu.v[x] ? 1 : 0;
    },
    // Set VX equal to VX bitshifted left 1. VF is set to the most significant bit of VX prior to the shift.
    '8XYE': (cpu, x, y) => {
        cpu.vf = (cpu.v[x] & 0x80) > 0 ? 1 : 0;
        cpu.v[x] = cpu.v[x] << 1;
    },
    // Copy contents from input port to VX. (Waits for EF4=1)
    'FXFB': (cpu, x) => {
        cpu.v[x] = 1; // TODO get input
    },
    // Copy values from memory location I through I + X into registers V0 through VX. I does not change.
    'FX65': (cpu, x) => {
        for (let index = 0; index <= x; index++) {
            cpu.v[index] = cpu.memory[cpu.i + index]
        }
    },
    // Store registers V0 through VX in memory starting at location I. I does not change. '
    'FX55': (cpu, x) => {
        for (let i = 0; i <= x; i++) {
            cpu.memory[cpu.i + i] = cpu.v[i]
        }
    },
    '00BN': () => {
        debugger;
    },
    '00CN': () => {
        debugger;
    },
    // Clears the display. Sets all pixels to off.
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
    // Set VX equal to the bitwise xor of the values in VX and VY.
    '8XY3': (cpu, x, y) => {
        cpu.v[x] = cpu.v[x] ^ cpu.v[y];
    },
    // Set VX equal to VX minus VY. In the case of an underflow VF is set 0. Otherwise 1. (VF = VX > VY)
    '8XY5': (cpu, x, y) => {
        const sub = cpu.v[x] - cpu.v[y];
        cpu.vf = cpu.v[x] > cpu.v[y] ? 1 : 0;
        cpu.v[x] = sub < 0 ? sub + 0xFFFF : sub;
    },
    // Skip the next instruction if VX does not equal VY.
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

