import Koa from 'koa'
import Router from '@koa/router'
import Multer from '@koa/multer'

import React from 'react'
import { renderToString } from 'react-dom/server'

import { Page } from './components/page'
import { ThermostatForm } from './components/thermostat-form'
import { SwitchForm } from './components/switch-form'

import { promiseThatResolvesIn } from '../lib/utils' 

const DEBUG = true

const isNumber = value => typeof value === 'number' && !isNaN(value)

export const WebInterface = ({
    port,
    things
}) => {

    DEBUG && console.log('WEB: initializing')

    const app = new Koa()
    const router = new Router()
    const multer = Multer()

    router.get(
        '/',
        async (ctx) => {
            const thermostats = Array.from(things.values()).filter(thing => thing.type === 'thermostat')
            const switchies = Array.from(things.values()).filter(thing => thing.type === 'switch' && !thing.hidden) // switch is reserved, refer to switches as switchies
            ctx.body = '<!DOCTYPE html>' + renderToString(
                <Page>
                    <h3>THERMOSTATS</h3>
                    {thermostats.map(thermostat => (
                        <p key={thermostat.id}><a href={`/thermostat/${thermostat.id}`}>{thermostat.label}</a></p>
                    ))}
                    <h3>SWITCHES</h3>
                    {switchies.map(switchie => (
                        <p key={switchie.id}><a href={`/switch/${switchie.id}`}>{switchie.label}</a></p>
                    ))}
                </Page>
            )
        }
    )

    router.get(
        '/thermostat/:id',
        async (ctx) => {

            // find and validate thermostat
            const thermostat = things.get(ctx.params.id)
            if (!thermostat) { throw new Error('Invalid thermostat id.') }
            if (!thermostat.getCurrentTemperature || !thermostat.getTargetTemperature) { throw new Error('Invalid thermostat object.') }

            // read thermostat
            const currentTemperature = await thermostat.getCurrentTemperature()
            const targetTemperature = await thermostat.getTargetTemperature()

            // send response
            ctx.body = '<!DOCTYPE html>' + renderToString(
                <Page>
                    <ThermostatForm
                        currentTemperature={currentTemperature}
                        targetTemperature={targetTemperature}
                        label={thermostat.label}
                    />
                </Page>
            )
        }
    )

    router.post(
        '/thermostat/:id',
        multer.none(),
        async (ctx) => {

            // find and validate thermostat
            const thermostat = things.get(ctx.params.id)
            if (!thermostat) { throw new Error('Invalid thermostat id.') }
            if (!thermostat.setTargetTemperature) { throw new Error('Invalid thermostat object.') }

            // validate form input
            const newTargetTemperature = parseFloat(ctx.request.body.targettemp)
            if (isNaN(newTargetTemperature)) { throw new Error('Invalid temperature value.') }

            // write thermostat
            await thermostat.setTargetTemperature(newTargetTemperature)

            // send response
            ctx.status = 301 // permanent redirect
            ctx.redirect(`/thermostat/${ctx.params.id}`)
            ctx.body = 'OK'
        }
    )

    router.get(
        '/switch/:id',
        async (ctx) => {

            // find and validate switch
            const switchie = things.get(ctx.params.id)
            if (!switchie) { throw new Error('Invalid switch id.') }
            if (!switchie.getState) { throw new Error('Invalid switch object.') }

            // read switch
            const currentState = await switchie.getState()

            // send response
            ctx.body = '<!DOCTYPE html>' + renderToString(
                <Page>
                    <SwitchForm
                        currentState={currentState}
                        label={switchie.label}
                    />
                </Page>
            )
        }
    )

    router.post(
        '/switch/:id',
        multer.none(),
        async (ctx) => {

            // find and validate switch
            const switchie = things.get(ctx.params.id)
            if (!switchie) { throw new Error('Invalid switch id.') }
            if (!switchie.on || !switchie.off) { throw new Error('Invalid switch object.') }

            // validate form input
            const newState = ctx.request.body.newstate

            if (newState === 'on') {
                await switchie.on()
            } else if (newState === 'off') {
                await switchie.off()
            } else {
               throw new Error('Invalid switch state.')
            }
            
            // HACK: wait until tradfri client library updates switch state
            await promiseThatResolvesIn(500)

            // send response
            ctx.status = 301 // permanent redirect
            ctx.redirect(`/switch/${ctx.params.id}`)
            ctx.body = 'OK'
        }
    )

    app.use(router.routes())
    app.use(router.allowedMethods())
    app.listen(port);
    DEBUG && console.log(`WEB: listening on ${port}`)
}
