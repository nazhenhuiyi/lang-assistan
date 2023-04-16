/* eslint-disable @typescript-eslint/no-explicit-any */
import { listen, TauriEvent } from '@tauri-apps/api/event'
import { appWindow, PhysicalPosition, PhysicalSize } from '@tauri-apps/api/window'
import { useEffect, useLayoutEffect } from 'react'

export type WindowMemoProps = {
    size: boolean
    position: boolean
}

/**
 * memorized window props
 */
export const useMemoWindow = (props: WindowMemoProps) => {
    useEffect(() => {
        const initWindow = async () => {
            try {
                if (props.position) {
                    const storagePosition = localStorage.getItem('_position')
                    if (storagePosition) {
                        const { x, y } = JSON.parse(storagePosition)
                        await appWindow.setPosition(new PhysicalPosition(x, y))
                    } else {
                        await appWindow.center()
                    }
                } else {
                    localStorage.removeItem('_position')
                }
                if (props.size) {
                    const storageSize = localStorage.getItem('_size')
                    if (storageSize) {
                        const { height, width } = JSON.parse(storageSize)
                        await appWindow.setSize(new PhysicalSize(width, height))
                    }
                } else {
                    localStorage.removeItem('_size')
                }
            } catch (e) {
                console.error(e)
            } finally {
                await appWindow.unminimize()
                await appWindow.setFocus()
                await appWindow.show()
            }
        }
        initWindow()
    }, [])

    useEffect(() => {
        let unListenMove: (() => void) | undefined
        let unListenResize: (() => void) | undefined
        listen(TauriEvent.WINDOW_MOVED, (event: { payload: any }) => {
            localStorage.setItem('_position', JSON.stringify(event.payload))
        }).then((unListen) => {
            unListenMove = unListen
        })
        listen(TauriEvent.WINDOW_RESIZED, (event: { payload: any }) => {
            localStorage.setItem('_size', JSON.stringify(event.payload))
        }).then((unListen) => {
            unListenResize = unListen
        })
        return () => {
            unListenMove?.()
            unListenResize?.()
        }
    }, [])
}
