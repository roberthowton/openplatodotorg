import type { CollectionEntry } from 'astro:content'
import type { FC } from "react"
import { $show } from '../stores/show'
import { ShowState } from '../types'
import { useStore } from "@nanostores/react"


type DialogContainerProps = {
  greekText: CollectionEntry<"dialogs">
  englishText: CollectionEntry<"dialogs">
}

const DialogContainer: FC<DialogContainerProps> = ({ greekText, englishText }) => {

  const show = useStore($show)

  console.log({show})

  const greekStyle = show === ShowState.ENGLISH ? { display: "none"} : {}
  const englishStyle = show === "greek" ? { display: "none"} : {}


  return (
    <>
      <div style={greekStyle} id="greek">
        {
          Object.entries(greekText.data).map(([key, value]) => (
            <article id={key}>
              {Object.entries(value).map(([key, value]) => (
                <section className={key}>
                  {value.replace(/\`/g, "")}
                </section>
              ))}
            </article>
          ))
        }
      </div>
      <div id="english" style={englishStyle}>
        {
          Object.entries(englishText.data).map(([key, value]) => (
            <article id={key}>
              {Object.entries(value).map(([key, value]) => (
                <section className={key}>
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