import React, {DragEventHandler, useRef, useState} from 'react';
import './App.css';
import {useInterval} from "usehooks-ts";
import {Chip8} from "./chip-8";
import {maze} from "./programs";

const FPS = 30;
const UPS = 120;

function App() {
    const cpu = useRef(new Chip8(maze));
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
