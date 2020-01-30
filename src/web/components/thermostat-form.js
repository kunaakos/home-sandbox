import React from 'react'

export const ThermostatForm = ({
    currentTemperature,
    targetTemperature,
    label
}) => {
    return (<>
        <h3>THERMOSTAT: {label}</h3>
        <p>room temperature is {currentTemperature}&deg;C</p>
        <p>requested temperature is {targetTemperature}&deg;C</p>
        <form
            method="post"
            encType="multipart/form-data"
            autoComplete="off"
        >
            <label style={{
                marginRight: '10px'
            }}>
                <input
                    type="text"
                    name="targettemp"
                    placeholder={'request temperature'}
                />
            </label>
            <input
                type="submit"
                value="OK"
            />
        </form>
        <p><a href="/">go back</a></p>
    </>)
}
