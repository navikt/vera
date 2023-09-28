import { Suspense } from "react"
import DiffHeader from "./DiffHeader"

// This component passed as fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function DiffHeaderFallback() {
  return <>placeholder</>
}

export default async function DiffPage() {
  return (
    <>
    <Suspense fallback={<DiffHeaderFallback />}>
      <DiffHeader/>
      </Suspense>
    </>
  )
}
