import {opcodes} from "./opcodes";

const parameters = ['X', 'Y', 'NNN', 'NN', 'N'];

interface Instruction {
    instruction: string,
    opcode: keyof typeof opcodes,
    parameters: number[],
}

export class OpcodeMatcher {
    parameters: [string, string][]
    opcodes: [string, string][]

    constructor() {
        this.parameters = parameters.map(parameter => [
            parameter,
            this.regexFromParameter(parameter),
        ])

        this.opcodes = Object.keys(opcodes).map(opcode => [
            opcode,
            this.regexForInstruction(opcode),
        ])
    }

    regexFromParameter(parameter: string) {
        return `(.{${parameter.length}})`;
    }

    regexForInstruction(instruction: string) {
        this.parameters.forEach(([parameter, regex]) => {
            instruction = instruction.replace(parameter, regex);
        })

        return instruction;
    }

    disassembleFromRaw(rawInstruction: string): Instruction | null {
        console.assert(rawInstruction.length === 4, `Instruction ${rawInstruction} is not 4 chars long`);

        for (const [opcode, regex] of this.opcodes) {
            const match = rawInstruction.match(new RegExp(regex, 'i'));
            if (match) {
                return {
                    instruction: rawInstruction,
                    opcode: opcode,
                    parameters: match.splice(1).map(parameter => parseInt(parameter, 16)),
                }
            }
        }

        return null;
    }
}
