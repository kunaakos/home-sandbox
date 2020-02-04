import React from 'react'

export const SwitchForm = ({
    currentState,
    label
}) => {
    return (<>
        <h3>Switch: {label}</h3>
        <form
            method="post"
            encType="multipart/form-data"
            autoComplete="off"
        >
            <input
                type="hidden"
                name="newstate"
                value={currentState ? "off" : "on"}
            />
            <input
                type="submit"
                value={currentState ? "TURN OFF" : "TURN ON"}
            />
        </form>
        <p><a href="/">go back</a></p>
    </>)
}
