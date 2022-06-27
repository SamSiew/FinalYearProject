import React from 'react'
import { LineChart as LC, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts'

export default function LineChart({ records, lines, xAxisKey, units }) {
    return (
        <ResponsiveContainer height="100%" width={records.length * 50}>
            <LC data={records}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} interval={1}/>
                <YAxis unit={units} domain={['dataMin', 'dataMax']}/>
                <Tooltip />
                <Legend verticalAlign="top" align="left" height={32}/>
                {
                    lines && lines.map((line, index) => (
                        <Line key={index} type="monotone" dataKey={line.key} stroke={line.strokeColour} />
                    ))
                }
            </LC>
        </ResponsiveContainer>
    )
}