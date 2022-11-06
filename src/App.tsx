import React, {useState} from 'react';
import './App.css';
import {useInterval} from "usehooks-ts";

const PROGRAM_MEMORY = 512;
const DISPLAY_WIDTH = 64;
const DISPLAY_HEIGHT = 32;

const codes = {
    maze: [
        'a21e', 'c201', '3201', 'a21a', 'd014', '7004', '3040', '1200',
        '6000', '7104', '3120', '1200', '1218', '8040', '2010', '2040',
        '8010',
    ],
    mazeAlt: [
        '6000', '6100', 'a222', 'c201', '3201', 'a21e', 'd014', '7004',
        '3040', '1204', '6000', '7104', '3120', '1204', '121c', '8040',
        '2010', '2040', '8010',
    ],
}

const code = codes.mazeAlt.map(instruction => instruction.toUpperCase());

let i = 0;
let pc = PROGRAM_MEMORY;
const memory = Array(4096).fill(0);
const stack = [];
const vx = Array(8).fill(0);
const sp = () => stack.length;
const display = Array(64).fill(0).map(() => Array(32).fill(false));

function dec2bin(dec: number) {
    return dec.toString(2).padStart(8, '0');
}

function rand() {
    return Math.floor(256 * Math.random());
}

const opcodes = {
    'ANNN': (nnn: number) => i = nnn,
    'CXNN': (x: number, nn: number) => vx[x] = rand() & nn,
    '3XNN': (x: number, nn: number) => {
        if (vx[x] === nn) {
            pc += 2
        }
    },
    'DXYN': (x: number, y: number, n: number) => {
        const _vx = vx[x];
        const _vy = vx[y];

        for (let b = 0; b < n; b++) {
            const byte = parseInt(memory[i + b], 16);
            const bits = dec2bin(byte);
            for (let a = 0; a < 8; a++) {
                const xx = _vx + a;
                const yy = _vy + b;
                const set = bits[a] === '1';
                if (set) {
                    display[xx % DISPLAY_WIDTH][yy % DISPLAY_HEIGHT] = true;
                }

                console.log('rendering', {
                    a,
                    b,
                    i,
                    x,
                    y,
                    n,
                    result: bits[a] === '0',
                    byte,
                    memory,
                    bit: bits[b],
                    bits,
                    display
                })
            }
        }
    }, // TODO: WTF
    '7XNN': (x: number, nn: number) => vx[x] += nn,
    '1NNN': (nnn: number) => pc = nnn,
    '6XNN': (x: number, nn: number) => vx[x] = nn,
    '8XY0': (x: number, y: number) => vx[x] = vx[y],
    '2NNN': (nnn: number) => {
        stack.push(pc);
        pc = nnn;
    }
}

function parameterToMatcher(parameter: string) {
    return `(.{${parameter.length}})`;
}

const parameters = ['X', 'Y', 'NNN', 'NN', 'N'];
const parameterMatchers = parameters.map(parameterToMatcher);
const instructions = [
    'ANNN',
    'CXNN',
    '3XNN',
    'DXYN',
    '7XNN',
    '1NNN',
    '6XNN',
    '8XY0',
    '2NNN',
]

function instructionToMatcher(instruction: string) {
    parameterMatchers.forEach((matcher, index) => {
        instruction = instruction.replace(parameters[index], matcher);
    })

    return instruction;
}

const instructionMatcher = instructions.map(instructionToMatcher)

function loadToMemory(code: any[]) {
    code.forEach((instruction, index) => {
        memory[PROGRAM_MEMORY + index * 2 + 0] = instruction.slice(0, 2);
        memory[PROGRAM_MEMORY + index * 2 + 1] = instruction.slice(2, 4);
    })
}

console.log(instructionMatcher)

function disassemble(rawInstruction: string) {
    console.log(`Disassembling ${rawInstruction}`)
    const matches = instructionMatcher.map((matcher, index) => {
        const match = rawInstruction.match(new RegExp(matcher));
        if (match) {
            return {
                instruction: instructions[index],
                parts: match,
            }
        }
    });
    const filteredMatches = matches.filter(Boolean);
    if (filteredMatches.length !== 1) {
        throw new Error(`Error while disassembling instruction ${rawInstruction}`);
    }

    const match = filteredMatches[0];

    return {rawInstruction, match};
}

function vblank() {
    for (let x = 0; x < 64; x++) {
        for (let y = 0; y < 32; y++) {
            display[x][y] = false;
        }
    }
}

function step() {
    // vblank();
    const raw = memory[pc] + memory[pc + 1];
    pc += 2;
    const instruction = disassemble(raw);

    console.log(instruction)

    // @ts-ignore
    const opcode = opcodes[instruction.match.instruction];

    const params = instruction?.match?.parts.splice(1).map(raw => parseInt(raw, 16));
    console.log({params})
    // @ts-ignore
    opcode(...params);
    console.log({
        i, pc, sp, memory, vx,
    })
}

function App() {
    const scale = 15;
    const [render, setRender] = useState<number[][]>(Array(64).fill(0).map(() => Array(32)));
    const [offset, setOffset] = useState(0);

    function stepAndRender() {
        step();
        setRender([...display])
    }

    useInterval(() => {
        // memory[600] = 0xf0;
        // memory[601] = 0x90;
        // memory[602] = 0x90;
        // memory[603] = 0x90;
        // memory[604] = 0xf0;
        // i = 600;
        // vx[0] = offset;
        // vx[1] = 10;
        // vblank();
        // opcodes['DXYN'](0, 1, 5);
        stepAndRender();
        // setOffset(offset + 1);
    }, 20)

    // useInterval(() => console.clear(), 5000);
    loadToMemory(code);
    return <div>
        <button onClick={() => stepAndRender()}>step</button>
        <div style={{position: 'relative'}}>
            {
                render.map((column, x) => (
                    column.map((value, y) => (
                        <div key={['x', x, 'y', y].join()} style={{
                            top: `${y * scale}px`,
                            left: `${x * scale}px`,
                            width: `${scale}px`,
                            height: `${scale}px`,
                            position: 'absolute',
                            background: render[x][y] ? 'orange' : 'gray'
                        }}>
                        </div>
                    ))
                ))

            }

        </div>
    </div>
}

export default App;
