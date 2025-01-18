import GuitarTab from "./GuitarTabEditor";
import {Metadata} from 'next'
import './globals.css';

export const metadata: Metadata = {
    title: 'Fretter',
    description: 'A simple guitar tab editor',
}

export default function Page() {
    return (
        <GuitarTab/>
    )
}