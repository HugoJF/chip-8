import React, {useState} from 'react';
import './App.css';
import {useInterval} from "usehooks-ts";

const PROGRAM_MEMORY = 512;
const DISPLAY_WIDTH = 64;
const DISPLAY_HEIGHT = 32;

function deepClone(subject: any) {
    return JSON.parse(JSON.stringify(subject));
}

function dec2bin(dec: number) {
    return dec.toString(2).padStart(8, '0');
}

function rand() {
    return Math.floor(256 * Math.random());
}

function matrix(x: number, y: number) {
    return Array(x).fill(0).map(() => Array(y).fill(0))
}

const opcodes = {
    'ANNN': (nnn: number) => i = nnn,
    'CXNN': (x: number, nn: number) => v[x] = rand() & nn,
    '3XNN': (x: number, nn: number) => {
        if (v[x] === nn) {
            pc += 2
        }
    },
    'DXYN': (x: number, y: number, n: number) => {
        const vx = v[x];
        const vy = v[y];

        for (let b = 0; b < n; b++) {
            const byte = parseInt(memory[i + b], 16);
            const bits = dec2bin(byte);
            for (let a = 0; a < 8; a++) {
                const xx = vx + a;
                const yy = vy + b;
                const set = bits[a] === '1';
                if (set) {
                    display[xx % DISPLAY_WIDTH][yy % DISPLAY_HEIGHT] = true;
                }
            }
        }
    },
    '7XNN': (x: number, nn: number) => v[x] += nn,
    '1NNN': (nnn: number) => pc = nnn,
    '6XNN': (x: number, nn: number) => v[x] = nn,
    '8XY0': (x: number, y: number) => v[x] = v[y],
    '2NNN': (nnn: number) => {
        stack.push(pc);
        pc = nnn;
    }
}

interface Instruction {
    instruction: string,
    opcode: keyof typeof opcodes,
    parameters: number[],
}

const codes: Record<string, string[]> = {
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
const v = Array(8).fill(0);
// const sp = () => stack.length;

const display = matrix(64, 32);

function parameterToMatcher(parameter: string) {
    return `(.{${parameter.length}})`;
}

const parameters = ['X', 'Y', 'NNN', 'NN', 'N'];
const parameterMatchers = parameters.map(parameterToMatcher);

function instructionToMatcher(instruction: string) {
    parameterMatchers.forEach((matcher, index) => {
        instruction = instruction.replace(parameters[index], matcher);
    })

    return instruction;
}

const instructions = Object.keys(opcodes);
const instructionMatcher = instructions.map(instructionToMatcher)

function loadToMemory(code: any[]) {
    code.forEach((instruction, index) => {
        memory[PROGRAM_MEMORY + index * 2 + 0] = instruction.slice(0, 2);
        memory[PROGRAM_MEMORY + index * 2 + 1] = instruction.slice(2, 4);
    })
}

function disassemble(rawInstruction: string): Instruction {
    console.assert(rawInstruction.length === 4, `Instruction ${rawInstruction} is not 4 chars long`);

    const matches = instructionMatcher.map((matcher, index) => {
        const match = rawInstruction.match(new RegExp(matcher));
        if (match) {
            return {
                instruction: match[0],
                opcode: instructions[index],
                parameters: match.splice(1).map(parameter => parseInt(parameter, 16)),
            }
        }

        return undefined;
    });

    const filteredMatches = matches.filter(Boolean);
    console.assert(filteredMatches.length === 1, `Expected only 1 match for instruction ${rawInstruction}, received ${filteredMatches}`);

    return filteredMatches[0] as Instruction;
}

function step() {
    const raw = memory[pc++] + memory[pc++];
    const instruction = disassemble(raw);

    const opcode = opcodes[instruction.opcode];

    // @ts-ignore
    opcode(...instruction.parameters);
}

loadToMemory(code);

function App() {
    const [render, setRender] = useState(matrix(64, 32));

    function stepAndRender() {
        step();
        setRender(deepClone(display))
    }

    useInterval(() => {
        stepAndRender();
    }, 20)

    return <div className="display">
        {render.map((column, x) => (
            <div className="display__column">
                {column.map((value, y) => (
                    <div
                        key={['x', x, 'y', y].join()}
                        className={`display__pixel ${render[x][y] ? 'active' : 'inactive'}`}
                    ></div>
                ))}
            </div>
        ))}
    </div>
}

export default App;
