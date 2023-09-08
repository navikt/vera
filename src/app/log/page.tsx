import LogTable from "./logTable"

export default async function LogPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <LogTable searchParams={searchParams}/>
  )
}
