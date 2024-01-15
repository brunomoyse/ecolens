"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type EnterpriseTest = {
    id: string
    name: string
    type: string
}

export const columns: ColumnDef<EnterpriseTest>[] = [
    {
        accessorKey: "name",
        header: "Nom",
    },
    {
        accessorKey: "type",
        header: "Forme",
    },
]
