import React, {DragEventHandler, useRef, useState} from 'react';
import './App.css';
import {useInterval} from "usehooks-ts";
import {Chip8} from "./chip-8";
import * as programs from "./programs";
import {Parser2} from "./parser";

const withoutSubroutines = (new Parser2)
    .drawLetter(1, 5, 5)
    .drawLetter(2, 10, 5)
    .drawLetter(3, 15, 5)
    .drawLetter(4, 15, 5)
    .loop()
    .compile();

const withSubroutines = (new Parser2)
    .addDrawLetterRoutine()
    .setVx(0, 1)
    .setVx(1, 5)
    .setVx(2, 5)
    .call('letter')
    .setVx(0, 2)
    .setVx(1, 10)
    .setVx(2, 5)
    .call('letter')
    .setVx(0, 3)
    .setVx(1, 15)
    .setVx(2, 5)
    .call('letter')
    .setVx(0, 4)
    .setVx(1, 20)
    .setVx(2, 5)
    .call('letter')
    .loop()
    .compile()
;

console.log('with', withSubroutines.length);
console.log('without', withoutSubroutines.length);

const FPS = 30;
const UPS = 120;

function App() {
    const cpu = useRef(new Chip8(withSubroutines));
    const [render, setRender] = useState(cpu.current.snapshot());

    // Render cycle
    useInterval(() => {
        setRender(cpu.current.snapshot());
    }, 1000 / Math.min(FPS, UPS))

    // Update cycle
    useInterval(() => {
        cpu.current.step();
    }, 1000 / UPS)

    const handleOnDragOver: DragEventHandler<HTMLDivElement> = e => {
        e.preventDefault();
    }

    const handleOnDrop: DragEventHandler<HTMLDivElement> = e => {
        e.preventDefault();
        const file = e.dataTransfer.files.item(0);
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const result = event.target!.result as ArrayBuffer;
            if (result) {
                cpu.current.loadFromArrayBuffer(new Uint8Array(result))
            }
        });
        reader.readAsArrayBuffer(file);
    }

    return <div className="display" onDragOver={handleOnDragOver} onDrop={handleOnDrop}>
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
