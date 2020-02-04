import React from 'react'

const getCurrentDateTimeString = () => {
    const date = new Date(Date.now())
    return `${date.toLocaleTimeString() } ${date.toDateString().toUpperCase()}`
}

export const Page = ({
    children
}) => (
    <React.Fragment>
        <html lang="en">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta httpEquiv="X-UA-Compatible" content="ie=edge"/>
            <title>BMO</title>
            <style>{`
                html {
                    background: #bbe1cc;
                }
                body, input {
                    font-family: monospace;
                }
                p, h1, h2, h3, h4, h5, h6 {
                    font-size: 1rem;
                    margin: 0.7rem 0;
                    line-height: 1;
                }
                input {
                    font-size: 1rem;
                    border: none;
                    background: transparent;
                }
                input[type=submit] {
                    text-decoration: underline;
                    cursor: pointer;
                    padding: 0;
                }
                input[type=text] {
                    padding: 0;
                    margin-right: -1px;
                }
                input[type=text]:focus, input[type=submit]:focus {
                    outline: none;
                }
                a {
                    color: black;
                }
            `}</style>
        </head>
        <body>
            <h1>BMO</h1>
            <p>status at {getCurrentDateTimeString()}</p>
                {children}
                <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{__html: 'window.setTimeout(function() { window.location.reload(); }, 60 * 1000);'}}
                />
        </body>
    </html>
    </React.Fragment>
)
