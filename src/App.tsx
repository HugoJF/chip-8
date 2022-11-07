import React, {useRef, useState} from 'react';
import './App.css';
import {useInterval} from "usehooks-ts";
import {Chip8} from "./chip-8";
import {maze} from "./programs";

const FPS = 30;
const UPS = 60;

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

    return <div className="display">
        <input onChange={(e) => {
            console.log(e.target.files)

            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                const result = event.target!.result as ArrayBuffer;
                if (!result) return;
                console.log(new Uint8Array(result))
            });
            reader.readAsArrayBuffer(e.target.files![0]);
        }} type="file"/>
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
