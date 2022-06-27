import React from 'react'
import { BarChart as BC, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts'

export default function BarChart({ records, bars, xAxisKey, units}) {
    return (
        <ResponsiveContainer height="100%" width={records.length * 75}>
            <BC data={records}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} interval={1}/>
                <YAxis unit={units} domain={['dataMin', 'dataMax']}/>
                <Tooltip />
                <Legend verticalAlign="top" align="left" height={32}/>
                {
                    bars && bars.map((bar, index) => (
                        <Bar key={index} dataKey={bar.key} fill={bar.fillColour} />
                    ))
                }
            </BC>
        </ResponsiveContainer>
    )
}