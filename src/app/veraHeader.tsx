'use client'
import { InternalHeader } from "@navikt/ds-react";

export default function VeraHeader() {
    return (
        <InternalHeader>
            <InternalHeader.Title href="/">Vera</InternalHeader.Title>
            <InternalHeader.Title href="/log">Log</InternalHeader.Title>
            <InternalHeader.Title href="/diff">Diff</InternalHeader.Title>
        </InternalHeader>
    )
}