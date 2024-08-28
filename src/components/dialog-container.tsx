import type { CollectionEntry } from 'astro:content'
import type { FC } from "react"
import { $showState } from '../stores/show-state'
import { ShowState } from '../types'
import { useStore } from "@nanostores/react"


type DialogContainerProps = {
  EL: CollectionEntry<"dialogs"> | undefined
  EN: CollectionEntry<"dialogs"> | undefined
}

const DialogContainer: FC<DialogContainerProps> = ({ EL, EN }) => {

  const showState = useStore($showState)

  const greekStyle = showState === ShowState.ENGLISH ? { display: "none"} : {}
  const englishStyle = showState === "greek" ? { display: "none"} : {}

  if(EL === undefined || EN === undefined) return (
    <>
      <div style={greekStyle} id="404">
        <p>404 Text Not Found!</p>
      </div>
    </>
  )
  return (
    <>
      <div style={greekStyle} id="greek">
        {
          Object.entries(EL.data).map(([key, value]) => (
            <article key={key} id={key}>
              {Object.entries(value).map(([key, value]) => (
                <section key={key} className={key}>
                  {value.replace(/\`/g, "")}
                </section>
              ))}
            </article>
          ))
        }
      </div>
      <div id="english" style={englishStyle}>
        {
          Object.entries(EN.data).map(([key, value]) => (
            <article key={key} id={key}>
              {Object.entries(value).map(([key, value]) => (
                <section key={key} className={key}>
                  {value.replace(/\`/g, "")}
                </section>
              ))}
            </article>
          ))
        }
      </div>
    </>
  )
}

export default DialogContainer
export type {DialogContainerProps}
