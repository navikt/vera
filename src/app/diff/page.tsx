import DiffHeader from "./DiffHeader"
export default async function DiffPage({
  searchParams
}: {
  searchParams: {"base"?: string, "comparewith"?:string, "appFilter"?: string}
}) {
  return (
    <DiffHeader searchParams={searchParams}/>
  )
}
